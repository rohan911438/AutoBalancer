import { ethers } from 'ethers';
import { agentContract, RebalanceExecutionParams } from '../contracts/agent';
import { database, RebalancerConfig, ExecutionLog, AssetWeight } from '../services/database';
import { logger } from '../utils/logger';
import { getCurrentTimestamp } from '../utils/time';
import { 
  getMultipleTokenBalances, 
  calculateUSDValue, 
  getTokenInfo, 
  calculateMinOutputWithSlippage 
} from '../utils/tokens';
import { logExecutionToEnvio } from '../services/envio';
import { config } from '../config';

/**
 * Portfolio Balance Information
 */
export interface PortfolioBalance {
  tokenAddress: string;
  balance: bigint;
  usdValue: number;
  currentWeight: number; // Percentage of total portfolio
}

/**
 * Rebalance Recommendation
 */
export interface RebalanceRecommendation {
  tokenFrom: string;
  tokenTo: string;
  amountFrom: bigint;
  targetWeight: number;
  currentWeight: number;
  deviation: number;
}

/**
 * Rebalance Execution Result
 */
export interface RebalanceExecutionResult {
  success: boolean;
  configId: string;
  txHash?: string;
  amountsIn?: bigint[];
  amountsOut?: bigint[];
  gasUsed?: bigint;
  errorMessage?: string;
  skipReason?: string;
  recommendations?: RebalanceRecommendation[];
}

/**
 * Rebalance Engine Service
 * 
 * Handles automated portfolio rebalancing based on target asset weights.
 * Monitors portfolio deviations and executes rebalancing trades when thresholds are exceeded.
 */
export class RebalanceEngine {
  private defaultSlippageTolerance = 5; // 5% slippage tolerance
  private minRebalanceInterval = 3600; // Minimum 1 hour between rebalances

  constructor() {
    logger.info('⚖️ Rebalance Engine initialized');
  }

  /**
   * Process all active rebalancer configurations
   * 
   * @returns Array of execution results
   */
  async processAllConfigurations(): Promise<RebalanceExecutionResult[]> {
    try {
      logger.info('🔄 Processing all active rebalancer configurations...');

      const { rebalancerConfigs } = await database.getActiveItems();
      const activeConfigs = rebalancerConfigs.filter(config => config.isActive);

      if (activeConfigs.length === 0) {
        logger.info('📭 No active rebalancer configurations to process');
        return [];
      }

      logger.info(`📊 Found ${activeConfigs.length} active rebalancer configurations`);

      const results: RebalanceExecutionResult[] = [];

      // Process configurations sequentially to avoid conflicts
      for (const config of activeConfigs) {
        try {
          const result = await this.processConfiguration(config);
          results.push(result);

          // Add delay between rebalances
          if (result.success) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          logger.error(`❌ Error processing rebalancer config ${config.id}:`, error);
          results.push({
            success: false,
            configId: config.id,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      const successful = results.filter(r => r.success).length;
      const skipped = results.filter(r => r.skipReason).length;
      const failed = results.filter(r => !r.success && !r.skipReason).length;

      logger.info(`✅ Rebalance processing complete: ${successful} successful, ${skipped} skipped, ${failed} failed`);

      return results;
    } catch (error) {
      logger.error('❌ Failed to process rebalancer configurations:', error);
      throw error;
    }
  }

  /**
   * Process a single rebalancer configuration
   * 
   * @param config - Rebalancer configuration to process
   * @returns Execution result
   */
  async processConfiguration(config: RebalancerConfig): Promise<RebalanceExecutionResult> {
    const configId = config.id;

    try {
      logger.info(`🔍 Processing rebalancer configuration ${configId}`, {
        userAddress: config.userAddress,
        assetsCount: config.assets.length,
        threshold: config.rebalanceThreshold
      });

      // Check minimum time interval since last rebalance
      const currentTime = getCurrentTimestamp();
      if (config.lastRebalanceTime > 0 && 
          (currentTime - config.lastRebalanceTime) < this.minRebalanceInterval) {
        return {
          success: false,
          configId,
          skipReason: 'Too soon since last rebalance'
        };
      }

      // Validate permission
      const permissionValid = await this.validatePermission(config);
      if (!permissionValid) {
        logger.warn(`🚫 Permission validation failed for config ${configId}`);
        return {
          success: false,
          configId,
          skipReason: 'Permission validation failed'
        };
      }

      // Get current portfolio balances
      const portfolio = await this.getPortfolioBalances(config);
      
      // Calculate rebalance recommendations
      const recommendations = await this.calculateRebalanceRecommendations(config, portfolio);

      // Check if rebalancing is needed
      const maxDeviation = Math.max(...recommendations.map(r => Math.abs(r.deviation)));
      
      if (maxDeviation < config.rebalanceThreshold) {
        return {
          success: false,
          configId,
          skipReason: `Portfolio deviation ${maxDeviation.toFixed(2)}% below threshold ${config.rebalanceThreshold}%`,
          recommendations
        };
      }

      logger.info(`📈 Rebalancing needed for config ${configId}`, {
        maxDeviation: maxDeviation.toFixed(2),
        threshold: config.rebalanceThreshold,
        recommendationsCount: recommendations.length
      });

      // Execute rebalancing
      const executionResult = await this.executeRebalance(config, recommendations);

      // Update configuration data
      if (executionResult.success) {
        await database.updateRebalancerConfig(configId, {
          lastRebalanceTime: currentTime,
          totalRebalances: config.totalRebalances + 1,
          updatedAt: currentTime
        });

        // Log execution
        await this.logExecution(config, executionResult, recommendations);
      }

      return {
        ...executionResult,
        recommendations
      };

    } catch (error) {
      logger.error(`❌ Error processing rebalancer configuration ${configId}:`, error);
      return {
        success: false,
        configId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get current portfolio balances for a user
   * 
   * @param config - Rebalancer configuration
   * @returns Portfolio balances with USD values and weights
   */
  async getPortfolioBalances(config: RebalancerConfig): Promise<PortfolioBalance[]> {
    try {
      const tokenAddresses = config.assets.map(asset => asset.tokenAddress);
      const balances = await getMultipleTokenBalances(tokenAddresses, config.userAddress);

      const portfolio: PortfolioBalance[] = [];
      let totalUsdValue = 0;

      // Calculate USD values for each asset
      for (const asset of config.assets) {
        const balance = balances[asset.tokenAddress] || 0n;
        const tokenInfo = await getTokenInfo(asset.tokenAddress);
        const usdValue = await calculateUSDValue(asset.tokenAddress, balance, tokenInfo.decimals);

        portfolio.push({
          tokenAddress: asset.tokenAddress,
          balance,
          usdValue,
          currentWeight: 0 // Will be calculated after we have total value
        });

        totalUsdValue += usdValue;
      }

      // Calculate current weights as percentages
      for (const item of portfolio) {
        item.currentWeight = totalUsdValue > 0 ? (item.usdValue / totalUsdValue) * 100 : 0;
      }

      logger.info(`💰 Portfolio analysis for config ${config.id}`, {
        totalUsdValue: totalUsdValue.toFixed(2),
        assets: portfolio.map(p => ({
          token: p.tokenAddress,
          currentWeight: p.currentWeight.toFixed(2) + '%',
          usdValue: p.usdValue.toFixed(2)
        }))
      });

      return portfolio;
    } catch (error) {
      logger.error(`❌ Failed to get portfolio balances for config ${config.id}:`, error);
      throw error;
    }
  }

  /**
   * Calculate rebalance recommendations based on target weights
   * 
   * @param config - Rebalancer configuration
   * @param portfolio - Current portfolio balances
   * @returns Array of rebalance recommendations
   */
  async calculateRebalanceRecommendations(
    config: RebalancerConfig, 
    portfolio: PortfolioBalance[]
  ): Promise<RebalanceRecommendation[]> {
    try {
      const recommendations: RebalanceRecommendation[] = [];
      const totalUsdValue = portfolio.reduce((sum, p) => sum + p.usdValue, 0);

      if (totalUsdValue === 0) {
        logger.warn(`💸 No portfolio value found for config ${config.id}`);
        return recommendations;
      }

      // Calculate deviations and create recommendations
      for (const asset of config.assets) {
        const portfolioItem = portfolio.find(p => 
          p.tokenAddress.toLowerCase() === asset.tokenAddress.toLowerCase()
        );

        if (!portfolioItem) continue;

        const deviation = portfolioItem.currentWeight - asset.targetWeight;
        const absDeviation = Math.abs(deviation);

        // Only recommend rebalancing if deviation is significant
        if (absDeviation > 0.1) { // More than 0.1% deviation
          // Determine rebalancing direction
          if (deviation > 0) {
            // Current weight too high, need to sell some
            const excessUsdValue = (deviation / 100) * totalUsdValue;
            const tokenInfo = await getTokenInfo(asset.tokenAddress);
            const excessAmount = BigInt(Math.floor(excessUsdValue * Math.pow(10, tokenInfo.decimals)));

            // Find target token with lowest current weight relative to target
            const underweightAssets = config.assets
              .map(a => {
                const p = portfolio.find(p => p.tokenAddress.toLowerCase() === a.tokenAddress.toLowerCase());
                return {
                  ...a,
                  currentWeight: p?.currentWeight || 0,
                  deficit: a.targetWeight - (p?.currentWeight || 0)
                };
              })
              .filter(a => a.deficit > 0)
              .sort((a, b) => b.deficit - a.deficit);

            if (underweightAssets.length > 0) {
              const targetAsset = underweightAssets[0];
              
              recommendations.push({
                tokenFrom: asset.tokenAddress,
                tokenTo: targetAsset.tokenAddress,
                amountFrom: excessAmount,
                targetWeight: asset.targetWeight,
                currentWeight: portfolioItem.currentWeight,
                deviation
              });
            }
          }
        }
      }

      logger.info(`🎯 Generated ${recommendations.length} rebalance recommendations for config ${config.id}`);

      return recommendations;
    } catch (error) {
      logger.error(`❌ Failed to calculate rebalance recommendations for config ${config.id}:`, error);
      throw error;
    }
  }

  /**
   * Validate permission for rebalancing
   * 
   * @param config - Rebalancer configuration
   * @returns True if permission is valid
   */
  private async validatePermission(config: RebalancerConfig): Promise<boolean> {
    try {
      // Get permission info from contract
      const permissionInfo = await agentContract.getPermissionInfo(config.permissionId);
      
      // Check if permission is still active
      if (!permissionInfo.owner || permissionInfo.owner === ethers.ZeroAddress) {
        logger.warn(`🚫 Permission ${config.permissionId} is not active`);
        return false;
      }

      // Check if user matches permission owner
      if (permissionInfo.owner.toLowerCase() !== config.userAddress.toLowerCase()) {
        logger.warn(`🚫 Permission owner mismatch for config ${config.id}`);
        return false;
      }

      // Check if there's sufficient allowance (estimate based on portfolio size)
      const minRequiredAllowance = BigInt('1000000000000000000'); // 1 ETH equivalent
      const remainingAllowance = permissionInfo.allowance - permissionInfo.spent;
      
      if (remainingAllowance < minRequiredAllowance) {
        logger.warn(`💸 Low allowance for config ${config.id}`, {
          remaining: remainingAllowance.toString()
        });
        // Don't block, but warn
      }

      return true;
    } catch (error) {
      logger.error(`❌ Permission validation error for config ${config.id}:`, error);
      return false;
    }
  }

  /**
   * Execute rebalancing trades through agent contract
   * 
   * @param config - Rebalancer configuration
   * @param recommendations - Rebalance recommendations
   * @returns Execution result
   */
  private async executeRebalance(
    config: RebalancerConfig, 
    recommendations: RebalanceRecommendation[]
  ): Promise<RebalanceExecutionResult> {
    try {
      if (recommendations.length === 0) {
        return {
          success: false,
          configId: config.id,
          skipReason: 'No rebalancing trades needed'
        };
      }

      // Prepare execution parameters
      const tokensFrom = recommendations.map(r => r.tokenFrom);
      const tokensTo = recommendations.map(r => r.tokenTo);
      const amountsFrom = recommendations.map(r => r.amountFrom);
      const minAmountsOut = amountsFrom.map(amount => 
        calculateMinOutputWithSlippage(amount, this.defaultSlippageTolerance)
      );

      const executionParams: RebalanceExecutionParams = {
        permissionId: config.permissionId,
        tokensFrom,
        tokensTo,
        amountsFrom,
        minAmountsOut
      };

      logger.info(`🚀 Executing rebalance for config ${config.id}`, {
        tradesCount: recommendations.length,
        tokensFrom,
        tokensTo,
        amountsFrom: amountsFrom.map(a => a.toString())
      });

      // Execute through agent contract
      const contractResult = await agentContract.executeRebalance(executionParams);

      logger.info(`✅ Rebalance execution successful for config ${config.id}`, {
        txHash: contractResult.txHash,
        amountsOut: contractResult.amountsOut.map(a => a.toString())
      });

      return {
        success: true,
        configId: config.id,
        txHash: contractResult.txHash,
        amountsIn: amountsFrom,
        amountsOut: contractResult.amountsOut
      };

    } catch (error) {
      logger.error(`❌ Rebalance execution failed for config ${config.id}:`, error);
      return {
        success: false,
        configId: config.id,
        errorMessage: error instanceof Error ? error.message : 'Rebalance execution failed'
      };
    }
  }

  /**
   * Log execution result to database and external services
   * 
   * @param config - Rebalancer configuration
   * @param result - Execution result
   * @param recommendations - Rebalance recommendations
   */
  private async logExecution(
    config: RebalancerConfig, 
    result: RebalanceExecutionResult,
    recommendations: RebalanceRecommendation[]
  ): Promise<void> {
    try {
      // Create execution log
      const executionLog: Omit<ExecutionLog, 'id'> = {
        type: 'rebalance',
        configId: config.id,
        userAddress: config.userAddress,
        permissionId: config.permissionId,
        txHash: result.txHash!,
        gasUsed: result.gasUsed?.toString() || '0',
        inputAmounts: result.amountsIn?.map(a => a.toString()) || [],
        outputAmounts: result.amountsOut?.map(a => a.toString()) || [],
        tokensFrom: recommendations.map(r => r.tokenFrom),
        tokensTo: recommendations.map(r => r.tokenTo),
        executedAt: getCurrentTimestamp(),
        status: 'success'
      };

      // Save to database
      const savedLog = await database.createExecutionLog(executionLog);

      // Log to Envio for analytics
      await logExecutionToEnvio(savedLog);

      logger.info(`📊 Rebalance execution logged for config ${config.id}`, {
        logId: savedLog.id,
        txHash: result.txHash
      });

    } catch (error) {
      logger.error(`❌ Failed to log rebalance execution for config ${config.id}:`, error);
      // Don't throw error as the main execution was successful
    }
  }

  /**
   * Get rebalancing statistics
   * 
   * @param userAddress - Optional user address filter
   * @returns Rebalancing statistics
   */
  async getRebalanceStats(userAddress?: string): Promise<any> {
    try {
      const configs = await database.getRebalancerConfigs(userAddress);
      const logs = await database.getExecutionLogs(userAddress, 1000);

      const totalConfigs = configs.length;
      const activeConfigs = configs.filter(c => c.isActive).length;
      const totalRebalances = logs.filter(l => l.type === 'rebalance').length;
      const successfulRebalances = logs.filter(l => l.type === 'rebalance' && l.status === 'success').length;

      return {
        totalConfigs,
        activeConfigs,
        totalRebalances,
        successfulRebalances,
        successRate: totalRebalances > 0 ? (successfulRebalances / totalRebalances) * 100 : 0
      };
    } catch (error) {
      logger.error('❌ Failed to get rebalance stats:', error);
      throw error;
    }
  }

  /**
   * Emergency pause all rebalancer configurations for a user
   * 
   * @param userAddress - User address
   * @returns Number of configurations paused
   */
  async emergencyPause(userAddress: string): Promise<number> {
    try {
      const configs = await database.getRebalancerConfigs(userAddress);
      let pausedCount = 0;

      for (const config of configs) {
        if (config.isActive) {
          await database.updateRebalancerConfig(config.id, { isActive: false });
          pausedCount++;
        }
      }

      logger.warn(`🚨 Emergency pause executed for user ${userAddress}`, {
        pausedConfigs: pausedCount
      });

      return pausedCount;
    } catch (error) {
      logger.error(`❌ Emergency pause failed for user ${userAddress}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const rebalanceEngine = new RebalanceEngine();