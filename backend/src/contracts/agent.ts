import { ethers, Contract } from 'ethers';
import { config, signer } from '../config';
import { logger } from '../utils/logger';

/**
 * AutoBalancer Agent Contract ABI
 * 
 * This ABI defines the interface for the ERC-7715 compatible agent contract
 * that handles automated DCA execution and portfolio rebalancing
 */
const AGENT_CONTRACT_ABI = [
  // ERC-7715 Permission Management
  "function delegatePermission(bytes32 parentPermissionId, address delegatee, uint256 delegatedAllowance, uint256 timeWindow) external returns (bytes32)",
  "function revokePermission(bytes32 permissionId) external",
  "function checkPermission(bytes32 permissionId, address user, uint256 amount) external view returns (bool)",
  
  // DCA Execution
  "function executeDCA(bytes32 permissionId, address tokenFrom, address tokenTo, uint256 amount, uint256 minAmountOut) external returns (uint256)",
  
  // Portfolio Rebalancing  
  "function executeRebalance(bytes32 permissionId, address[] calldata tokensFrom, address[] calldata tokensTo, uint256[] calldata amountsFrom, uint256[] calldata minAmountsOut) external returns (uint256[])",
  
  // Permission Queries
  "function getPermissionInfo(bytes32 permissionId) external view returns (address owner, uint256 allowance, uint256 spent, uint256 resetTime, uint256 timeWindow)",
  "function getUserPermissions(address user) external view returns (bytes32[])",
  
  // Events
  "event PermissionDelegated(bytes32 indexed permissionId, address indexed owner, address indexed delegatee, uint256 allowance)",
  "event DCAExecuted(bytes32 indexed permissionId, address indexed tokenFrom, address indexed tokenTo, uint256 amountIn, uint256 amountOut)",
  "event RebalanceExecuted(bytes32 indexed permissionId, address[] tokensFrom, address[] tokensTo, uint256[] amountsIn, uint256[] amountsOut)"
];

/**
 * Permission information structure
 */
export interface PermissionInfo {
  owner: string;
  allowance: bigint;
  spent: bigint;
  resetTime: bigint;
  timeWindow: bigint;
}

/**
 * DCA execution parameters
 */
export interface DCAExecutionParams {
  permissionId: string;
  tokenFrom: string;
  tokenTo: string;
  amount: bigint;
  minAmountOut: bigint;
}

/**
 * Rebalance execution parameters
 */
export interface RebalanceExecutionParams {
  permissionId: string;
  tokensFrom: string[];
  tokensTo: string[];
  amountsFrom: bigint[];
  minAmountsOut: bigint[];
}

/**
 * AutoBalancer Agent Contract Wrapper
 * 
 * Provides TypeScript interface for interacting with the ERC-7715 compatible
 * agent smart contract for automated trading operations
 */
export class AgentContract {
  private contract: Contract;

  constructor() {
    this.contract = new ethers.Contract(
      config.agentContractAddress,
      AGENT_CONTRACT_ABI,
      signer
    );
    
    logger.info(`📋 Agent contract initialized at ${config.agentContractAddress}`);
  }

  /**
   * Delegate permission to the agent for automated trading
   * 
   * @param parentPermissionId - Parent permission ID from ERC-7715
   * @param delegatee - Address to delegate permission to (agent address)
   * @param delegatedAllowance - Maximum amount that can be spent
   * @param timeWindow - Time window for allowance reset (in seconds)
   * @returns Transaction hash and new permission ID
   */
  async delegatePermission(
    parentPermissionId: string,
    delegatee: string,
    delegatedAllowance: bigint,
    timeWindow: bigint
  ): Promise<{ txHash: string; permissionId: string }> {
    try {
      logger.info('🔐 Delegating permission to agent', {
        parentPermissionId,
        delegatee,
        delegatedAllowance: delegatedAllowance.toString(),
        timeWindow: timeWindow.toString()
      });

      if (!this.contract) throw new Error('Contract not initialized');
      
      const contract = this.contract!;
      const tx = await (contract as any)['delegatePermission'](
        parentPermissionId,
        delegatee,
        delegatedAllowance,
        timeWindow
      );

      const receipt = await tx.wait();
      
      // Extract permission ID from event logs
      const event = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id('PermissionDelegated(bytes32,address,address,uint256)')
      );
      
      const permissionId = event?.topics[1] || '';

      logger.info('✅ Permission delegated successfully', {
        txHash: tx.hash,
        permissionId,
        gasUsed: receipt.gasUsed.toString()
      });

      return { txHash: tx.hash, permissionId };
    } catch (error) {
      logger.error('❌ Failed to delegate permission', { error });
      throw error;
    }
  }

  /**
   * Execute a DCA (Dollar Cost Averaging) trade
   * 
   * @param params - DCA execution parameters
   * @returns Transaction hash and output amount
   */
  async executeDCA(params: DCAExecutionParams): Promise<{ txHash: string; amountOut: bigint }> {
    try {
      logger.info('💰 Executing DCA trade', {
        permissionId: params.permissionId,
        tokenFrom: params.tokenFrom,
        tokenTo: params.tokenTo,
        amount: params.amount.toString()
      });

      // Check permission before execution
      const isValid = await this.checkPermission(
        params.permissionId,
        await signer.getAddress(),
        params.amount
      );

      if (!isValid) {
        throw new Error('Permission validation failed for DCA execution');
      }

      if (!this.contract) throw new Error('Contract not initialized');
      if (!this.contract) throw new Error('Contract not initialized');
      
      const contract = this.contract!;
      const tx = await (contract as any)['executeDCA'](
        params.permissionId,
        params.tokenFrom,
        params.tokenTo,
        params.amount,
        params.minAmountOut
      );

      const receipt = await tx.wait();
      
      // Extract amount out from event logs
      const event = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id('DCAExecuted(bytes32,address,address,uint256,uint256)')
      );
      
      // Parse the event data to get amountOut
      const amountOut = event ? ethers.AbiCoder.defaultAbiCoder().decode(['uint256', 'uint256'], event.data)[1] : 0n;

      logger.info('✅ DCA executed successfully', {
        txHash: tx.hash,
        amountOut: amountOut.toString(),
        gasUsed: receipt.gasUsed.toString()
      });

      return { txHash: tx.hash, amountOut };
    } catch (error) {
      logger.error('❌ Failed to execute DCA', { error, params });
      throw error;
    }
  }

  /**
   * Execute portfolio rebalancing
   * 
   * @param params - Rebalance execution parameters
   * @returns Transaction hash and output amounts
   */
  async executeRebalance(params: RebalanceExecutionParams): Promise<{ txHash: string; amountsOut: bigint[] }> {
    try {
      logger.info('⚖️ Executing portfolio rebalance', {
        permissionId: params.permissionId,
        tokensFrom: params.tokensFrom,
        tokensTo: params.tokensTo,
        amountsFrom: params.amountsFrom.map(a => a.toString())
      });

      // Check permission for total amount
      const totalAmount = params.amountsFrom.reduce((sum, amount) => sum + amount, 0n);
      const isValid = await this.checkPermission(
        params.permissionId,
        await signer.getAddress(),
        totalAmount
      );

      if (!isValid) {
        throw new Error('Permission validation failed for rebalance execution');
      }

      if (!this.contract) throw new Error('Contract not initialized');
      if (!this.contract) throw new Error('Contract not initialized');
      
      const contract = this.contract!;
      const tx = await (contract as any)['executeRebalance'](
        params.permissionId,
        params.tokensFrom,
        params.tokensTo,
        params.amountsFrom,
        params.minAmountsOut
      );

      const receipt = await tx.wait();
      
      // Extract amounts out from event logs
      const event = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id('RebalanceExecuted(bytes32,address[],address[],uint256[],uint256[])')
      );
      
      // Parse the event data to get amountsOut
      const amountsOut = event ? ethers.AbiCoder.defaultAbiCoder().decode(['uint256[]', 'uint256[]'], event.data)[1] : [];

      logger.info('✅ Rebalance executed successfully', {
        txHash: tx.hash,
        amountsOut: amountsOut.map((a: bigint) => a.toString()),
        gasUsed: receipt.gasUsed.toString()
      });

      return { txHash: tx.hash, amountsOut };
    } catch (error) {
      logger.error('❌ Failed to execute rebalance', { error, params });
      throw error;
    }
  }

  /**
   * Check if a permission is valid for a specific amount
   * 
   * @param permissionId - Permission ID to check
   * @param user - User address
   * @param amount - Amount to validate
   * @returns Whether the permission is valid
   */
  async checkPermission(permissionId: string, user: string, amount: bigint): Promise<boolean> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');
      if (!this.contract) throw new Error('Contract not initialized');
      
      const contract = this.contract!;
      return await (contract as any)['checkPermission'](permissionId, user, amount);
    } catch (error) {
      logger.error('❌ Failed to check permission', { error, permissionId, user, amount: amount.toString() });
      return false;
    }
  }

  /**
   * Get detailed information about a permission
   * 
   * @param permissionId - Permission ID to query
   * @returns Permission information
   */
  async getPermissionInfo(permissionId: string): Promise<PermissionInfo> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');
      if (!this.contract) throw new Error('Contract not initialized');
      
      const contract = this.contract!;
      const [owner, allowance, spent, resetTime, timeWindow] = await (contract as any)['getPermissionInfo'](permissionId);
      
      return {
        owner,
        allowance,
        spent,
        resetTime,
        timeWindow
      };
    } catch (error) {
      logger.error('❌ Failed to get permission info', { error, permissionId });
      throw error;
    }
  }

  /**
   * Get all permissions for a specific user
   * 
   * @param user - User address
   * @returns Array of permission IDs
   */
  async getUserPermissions(user: string): Promise<string[]> {
    try {
      if (!this.contract) throw new Error('Contract not initialized');
      if (!this.contract) throw new Error('Contract not initialized');
      
      const contract = this.contract!;
      return await (contract as any)['getUserPermissions'](user);
    } catch (error) {
      logger.error('❌ Failed to get user permissions', { error, user });
      throw error;
    }
  }

  /**
   * Revoke a delegated permission
   * 
   * @param permissionId - Permission ID to revoke
   * @returns Transaction hash
   */
  async revokePermission(permissionId: string): Promise<string> {
    try {
      logger.info('🚫 Revoking permission', { permissionId });

      if (!this.contract) throw new Error('Contract not initialized');
      if (!this.contract) throw new Error('Contract not initialized');
      
      const contract = this.contract!;
      const tx = await (contract as any)['revokePermission'](permissionId);
      const receipt = await tx.wait();

      logger.info('✅ Permission revoked successfully', {
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      });

      return tx.hash;
    } catch (error) {
      logger.error('❌ Failed to revoke permission', { error, permissionId });
      throw error;
    }
  }
}

// Export singleton instance
export const agentContract = new AgentContract();