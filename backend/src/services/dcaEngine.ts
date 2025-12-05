import { ethers } from 'ethers';
import { agentContract, DCAExecutionParams } from '../contracts/agent';
import { database, DcaPlan, ExecutionLog } from '../services/database';
import { logger } from '../utils/logger';
import { 
  isReadyForNextExecution, 
  isPlanExpired, 
  getCurrentTimestamp,
  TimePeriod 
} from '../utils/time';
import { 
  getTokenInfo, 
  calculateMinOutputWithSlippage,
  calculateUSDValue 
} from '../utils/tokens';
import { logExecutionToEnvio } from '../services/envio';

/**
 * DCA Execution Result
 */
export interface DCAExecutionResult {
  success: boolean;
  planId: string;
  txHash?: string;
  amountIn?: bigint;
  amountOut?: bigint;
  gasUsed?: bigint;
  errorMessage?: string;
  skipReason?: string;
}

/**
 * DCA Engine Service
 * 
 * Handles automated Dollar Cost Averaging execution for active plans.
 * Validates permissions, checks time windows, executes trades, and logs results.
 */
export class DCAEngine {
  private defaultSlippageTolerance = 5; // 5% slippage tolerance

  constructor() {
    logger.info('🤖 DCA Engine initialized');
  }

  /**
   * Process all active DCA plans
   * 
   * @returns Array of execution results
   */
  async processAllPlans(): Promise<DCAExecutionResult[]> {
    try {
      logger.info('🔄 Processing all active DCA plans...');

      const { dcaPlans } = await database.getActiveItems();
      const activePlans = dcaPlans.filter(plan => plan.isActive);

      if (activePlans.length === 0) {
        logger.info('📭 No active DCA plans to process');
        return [];
      }

      logger.info(`📊 Found ${activePlans.length} active DCA plans`);

      const results: DCAExecutionResult[] = [];

      // Process plans sequentially to avoid nonce issues
      for (const plan of activePlans) {
        try {
          const result = await this.processPlan(plan);
          results.push(result);

          // Add small delay between executions
          if (result.success) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          logger.error(`❌ Error processing plan ${plan.id}:`, error);
          results.push({
            success: false,
            planId: plan.id,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      const successful = results.filter(r => r.success).length;
      const skipped = results.filter(r => r.skipReason).length;
      const failed = results.filter(r => !r.success && !r.skipReason).length;

      logger.info(`✅ DCA processing complete: ${successful} successful, ${skipped} skipped, ${failed} failed`);

      return results;
    } catch (error) {
      logger.error('❌ Failed to process DCA plans:', error);
      throw error;
    }
  }

  /**
   * Process a single DCA plan
   * 
   * @param plan - DCA plan to process
   * @returns Execution result
   */
  async processPlan(plan: DcaPlan): Promise<DCAExecutionResult> {
    const planId = plan.id;

    try {
      logger.info(`🔍 Processing DCA plan ${planId}`, {
        userAddress: plan.userAddress,
        tokenPair: `${plan.tokenFrom} → ${plan.tokenTo}`,
        amountPerPeriod: plan.amountPerPeriod,
        period: plan.period
      });

      // Check if plan has expired
      if (isPlanExpired(plan.startTime, plan.duration)) {
        logger.info(`⏰ Plan ${planId} has expired, deactivating`);
        
        await database.updateDcaPlan(planId, { isActive: false });
        
        return {
          success: false,
          planId,
          skipReason: 'Plan expired'
        };
      }

      // Check if it's time for next execution
      if (plan.lastExecutionTime > 0 && !isReadyForNextExecution(plan.lastExecutionTime, plan.period)) {
        return {
          success: false,
          planId,
          skipReason: 'Not ready for next execution'
        };
      }

      // Validate permission
      const permissionValid = await this.validatePermission(plan);
      if (!permissionValid) {
        logger.warn(`🚫 Permission validation failed for plan ${planId}`);
        return {
          success: false,
          planId,
          skipReason: 'Permission validation failed'
        };
      }

      // Execute the DCA trade
      const executionResult = await this.executeDCA(plan);

      // Update plan execution data
      if (executionResult.success) {
        const currentTime = getCurrentTimestamp();
        const newTotalSpent = (BigInt(plan.totalAmountSpent) + BigInt(plan.amountPerPeriod)).toString();

        await database.updateDcaPlan(planId, {
          lastExecutionTime: currentTime,
          totalExecutions: plan.totalExecutions + 1,
          totalAmountSpent: newTotalSpent,
          updatedAt: currentTime
        });

        // Log execution to database and Envio
        await this.logExecution(plan, executionResult);
      }

      return executionResult;

    } catch (error) {
      logger.error(`❌ Error processing DCA plan ${planId}:`, error);
      return {
        success: false,
        planId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate permission for DCA execution
   * 
   * @param plan - DCA plan to validate
   * @returns True if permission is valid
   */
  private async validatePermission(plan: DcaPlan): Promise<boolean> {
    try {
      // Get permission info from contract
      const permissionInfo = await agentContract.getPermissionInfo(plan.permissionId);
      
      // Check if permission is still active
      if (!permissionInfo.owner || permissionInfo.owner === ethers.ZeroAddress) {
        logger.warn(`🚫 Permission ${plan.permissionId} is not active`);
        return false;
      }

      // Check if user matches permission owner
      if (permissionInfo.owner.toLowerCase() !== plan.userAddress.toLowerCase()) {
        logger.warn(`🚫 Permission owner mismatch for plan ${plan.id}`);
        return false;
      }

      // Check if there's enough allowance
      const amountNeeded = BigInt(plan.amountPerPeriod);
      const remainingAllowance = permissionInfo.allowance - permissionInfo.spent;
      
      if (remainingAllowance < amountNeeded) {
        logger.warn(`💸 Insufficient allowance for plan ${plan.id}`, {
          needed: amountNeeded.toString(),
          remaining: remainingAllowance.toString()
        });
        return false;
      }

      // Check contract-level permission validation
      const contractValidation = await agentContract.checkPermission(
        plan.permissionId,
        plan.userAddress,
        amountNeeded
      );

      if (!contractValidation) {
        logger.warn(`🚫 Contract permission validation failed for plan ${plan.id}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error(`❌ Permission validation error for plan ${plan.id}:`, error);
      return false;
    }
  }

  /**
   * Execute DCA trade through agent contract
   * 
   * @param plan - DCA plan to execute
   * @returns Execution result
   */
  private async executeDCA(plan: DcaPlan): Promise<DCAExecutionResult> {
    try {
      const amountIn = BigInt(plan.amountPerPeriod);
      
      // Calculate minimum output with slippage protection
      // In production, this would use a price oracle or DEX price quote
      const minAmountOut = this.calculateMinOutput(amountIn, plan.tokenFrom, plan.tokenTo);

      const executionParams: DCAExecutionParams = {
        permissionId: plan.permissionId,
        tokenFrom: plan.tokenFrom,
        tokenTo: plan.tokenTo,
        amount: amountIn,
        minAmountOut
      };

      logger.info(`🚀 Executing DCA trade for plan ${plan.id}`, {
        amountIn: amountIn.toString(),
        minAmountOut: minAmountOut.toString(),
        tokenPair: `${plan.tokenFrom} → ${plan.tokenTo}`
      });

      // Execute through agent contract
      const contractResult = await agentContract.executeDCA(executionParams);

      logger.info(`✅ DCA execution successful for plan ${plan.id}`, {
        txHash: contractResult.txHash,
        amountOut: contractResult.amountOut.toString()
      });

      return {
        success: true,
        planId: plan.id,
        txHash: contractResult.txHash,
        amountIn,
        amountOut: contractResult.amountOut
      };

    } catch (error) {
      logger.error(`❌ DCA execution failed for plan ${plan.id}:`, error);
      return {
        success: false,
        planId: plan.id,
        errorMessage: error instanceof Error ? error.message : 'Trade execution failed'
      };
    }
  }

  /**
   * Calculate minimum output amount with slippage protection
   * 
   * @param amountIn - Input amount
   * @param tokenFrom - Source token address
   * @param tokenTo - Destination token address
   * @returns Minimum output amount
   */
  private calculateMinOutput(amountIn: bigint, tokenFrom: string, tokenTo: string): bigint {
    // In production, this would:
    // 1. Get current price from DEX or price oracle
    // 2. Calculate expected output
    // 3. Apply slippage tolerance
    
    // For now, use a simple mock calculation
    // Assume 1:1 ratio with slippage tolerance
    const expectedOutput = amountIn; // Mock 1:1 ratio
    return calculateMinOutputWithSlippage(expectedOutput, this.defaultSlippageTolerance);
  }

  /**
   * Log execution result to database and external services
   * 
   * @param plan - DCA plan that was executed
   * @param result - Execution result
   */
  private async logExecution(plan: DcaPlan, result: DCAExecutionResult): Promise<void> {
    try {
      // Create execution log
      const executionLog: Omit<ExecutionLog, 'id'> = {
        type: 'dca',
        planId: plan.id,
        userAddress: plan.userAddress,
        permissionId: plan.permissionId,
        txHash: result.txHash!,
        gasUsed: result.gasUsed?.toString() || '0',
        inputAmount: result.amountIn?.toString() || plan.amountPerPeriod,
        outputAmount: result.amountOut?.toString() || '0',
        tokenFrom: plan.tokenFrom,
        tokenTo: plan.tokenTo,
        executedAt: getCurrentTimestamp(),
        status: 'success'
      };

      // Save to database
      const savedLog = await database.createExecutionLog(executionLog);

      // Log to Envio for analytics
      await logExecutionToEnvio(savedLog);

      logger.info(`📊 Execution logged for plan ${plan.id}`, {
        logId: savedLog.id,
        txHash: result.txHash
      });

    } catch (error) {
      logger.error(`❌ Failed to log execution for plan ${plan.id}:`, error);
      // Don't throw error as the main execution was successful
    }
  }

  /**
   * Get DCA execution statistics
   * 
   * @param userAddress - Optional user address filter
   * @returns Execution statistics
   */
  async getExecutionStats(userAddress?: string): Promise<any> {
    try {
      const plans = await database.getDcaPlans(userAddress);
      const logs = await database.getExecutionLogs(userAddress, 1000);

      const totalPlans = plans.length;
      const activePlans = plans.filter(p => p.isActive).length;
      const totalExecutions = logs.filter(l => l.type === 'dca').length;
      const successfulExecutions = logs.filter(l => l.type === 'dca' && l.status === 'success').length;
      const totalVolumeProcessed = plans.reduce((sum, plan) => sum + BigInt(plan.totalAmountSpent), 0n);

      return {
        totalPlans,
        activePlans,
        totalExecutions,
        successfulExecutions,
        successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
        totalVolumeProcessed: totalVolumeProcessed.toString()
      };
    } catch (error) {
      logger.error('❌ Failed to get execution stats:', error);
      throw error;
    }
  }

  /**
   * Emergency pause all DCA plans for a user
   * 
   * @param userAddress - User address
   * @returns Number of plans paused
   */
  async emergencyPause(userAddress: string): Promise<number> {
    try {
      const plans = await database.getDcaPlans(userAddress);
      let pausedCount = 0;

      for (const plan of plans) {
        if (plan.isActive) {
          await database.updateDcaPlan(plan.id, { isActive: false });
          pausedCount++;
        }
      }

      logger.warn(`🚨 Emergency pause executed for user ${userAddress}`, {
        pausedPlans: pausedCount
      });

      return pausedCount;
    } catch (error) {
      logger.error(`❌ Emergency pause failed for user ${userAddress}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const dcaEngine = new DCAEngine();