import { ethers, Contract } from 'ethers';
import { config, signer } from '../config';
import { logger } from '../utils/logger';

/**
 * AutoBalancer Agent Contract ABI
 * 
 * This ABI matches the deployed AutoBalancerAgent contract on Sepolia
 * Contract Address: 0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815
 */
const AGENT_CONTRACT_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "fromAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "toAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "action",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "executionId",
				"type": "bytes32"
			}
		],
		"name": "AssetRebalanced",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "tokenFrom",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "tokenTo",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "executedAt",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "executionId",
				"type": "bytes32"
			}
		],
		"name": "DCAExecuted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "delegationId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "delegatee",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "remainingAllowance",
				"type": "uint256"
			}
		],
		"name": "DelegationUsed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "parentPermissionId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "delegator",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "delegatee",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "delegationId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "createdAt",
				"type": "uint256"
			}
		],
		"name": "PermissionDelegated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalAssets",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalValue",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "executedAt",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bytes32",
				"name": "executionId",
				"type": "bytes32"
			}
		],
		"name": "RebalanceExecuted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "delegationId",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "checkDelegationAllowance",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "parentPermissionId",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "delegatee",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			}
		],
		"name": "delegatePermission",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "delegationId",
				"type": "bytes32"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "delegations",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "parentPermissionId",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "delegatee",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "spent",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "createdAt",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "tokenFrom",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "tokenTo",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "executeDCA",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"components": [
					{
						"internalType": "address",
						"name": "token",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "targetPercent",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "currentAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "targetAmount",
						"type": "uint256"
					}
				],
				"internalType": "struct AutoBalancerAgent.AssetWeight[]",
				"name": "targets",
				"type": "tuple[]"
			}
		],
		"name": "executeRebalance",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getContractInfo",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "version",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "delegationId",
				"type": "bytes32"
			}
		],
		"name": "getDelegationInfo",
		"outputs": [
			{
				"components": [
					{
						"internalType": "bytes32",
						"name": "parentPermissionId",
						"type": "bytes32"
					},
					{
						"internalType": "address",
						"name": "delegatee",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "allowance",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "spent",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "createdAt",
						"type": "uint256"
					}
				],
				"internalType": "struct AutoBalancerAgent.DelegationInfo",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "delegationId",
				"type": "bytes32"
			}
		],
		"name": "getDelegationRemainingAllowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "delegationId",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "useDelegation",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "token",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "targetPercent",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "currentAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "targetAmount",
						"type": "uint256"
					}
				],
				"internalType": "struct AutoBalancerAgent.AssetWeight[]",
				"name": "targets",
				"type": "tuple[]"
			}
		],
		"name": "validateAssetWeights",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	}
];

/**
 * Asset weight structure for rebalancing
 */
export interface AssetWeight {
  token: string;
  targetPercent: bigint;
  currentAmount: bigint;
  targetAmount: bigint;
}

/**
 * Delegation information structure
 */
export interface DelegationInfo {
  parentPermissionId: string;
  delegatee: string;
  allowance: bigint;
  spent: bigint;
  isActive: boolean;
  createdAt: bigint;
}

/**
 * DCA execution parameters
 */
export interface DCAExecutionParams {
	permissionId?: string;
	user?: string;
	tokenFrom: string;
	tokenTo: string;
	amount: bigint;
	minAmountOut?: bigint;
}

/**
 * Rebalance execution parameters
 */
export interface RebalanceExecutionParams {
	permissionId?: string;
	user?: string;
	tokensFrom?: string[];
	tokensTo?: string[];
	amountsFrom?: bigint[];
	minAmountsOut?: bigint[];
}

/**
 * Delegation parameters
 */
export interface DelegationParams {
  parentPermissionId: string;
  delegatee: string;
  allowance: bigint;
}

/**
 * AutoBalancer Agent Contract Wrapper
 * 
 * Provides TypeScript interface for interacting with the deployed
 * AutoBalancerAgent smart contract for automated trading operations
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
   * Get contract information
   * 
   * @returns Contract metadata
   */
  async getContractInfo(): Promise<{ name: string; version: string; description: string }> {
    try {
	const [name, version, description] = await (this.contract as any)['getContractInfo']();
      return { name, version, description };
    } catch (error) {
      logger.error('❌ Failed to get contract info', { error });
      throw error;
    }
  }

  /**
   * Delegate permission to another address
   * 
   * @param params - Delegation parameters
   * @returns Transaction hash and delegation ID
   */
  async delegatePermission(params: DelegationParams): Promise<{ txHash: string; delegationId: string }> {
    try {
      logger.info('🔐 Delegating permission', params);

			const tx = await (this.contract as any)['delegatePermission'](
				params.parentPermissionId,
				params.delegatee,
				params.allowance
			);

      const receipt = await tx.wait();
      
      // Extract delegation ID from event logs
      const event = receipt.logs.find((log: any) => 
        log.fragment?.name === 'PermissionDelegated'
      );
      
      const delegationId = event?.args?.delegationId || '';

      logger.info('✅ Permission delegated successfully', {
        txHash: tx.hash,
        delegationId,
        gasUsed: receipt.gasUsed.toString()
      });

      return { txHash: tx.hash, delegationId };
    } catch (error) {
      logger.error('❌ Failed to delegate permission', { error, params });
      throw error;
    }
  }

  /**
   * Execute a DCA (Dollar Cost Averaging) trade
   * 
   * @param params - DCA execution parameters
   * @returns Transaction hash
   */
	async executeDCA(params: DCAExecutionParams): Promise<{ txHash: string; executionId: string; amountOut?: bigint }> {
    try {
      logger.info('💰 Executing DCA trade', params);

			// Try calling executeDCA with several common signatures
			let tx: any;
			if (typeof (this.contract as any).executeDCA === 'function') {
				try {
					// Preferred signature: (permissionId?, tokenFrom, tokenTo, amount)
					tx = await (this.contract as any).executeDCA(
						params.user || params.permissionId || params.user || '',
						params.tokenFrom,
						params.tokenTo,
						params.amount
					);
				} catch (e) {
					// Fallback: try signature without user/permission
					tx = await (this.contract as any).executeDCA(
						params.tokenFrom,
						params.tokenTo,
						params.amount
					);
				}
			} else {
				throw new Error('executeDCA not supported by contract');
			}

			const receipt = await tx.wait();

			// Parse DCAExecuted event if present
			let executionId = '';
			let amountOut: bigint = 0n;
			const event = receipt.logs.find((log: any) => log.fragment?.name === 'DCAExecuted');
			if (event && event.args) {
				executionId = event.args.executionId || '';
				if (event.args.toAmount !== undefined) {
					amountOut = BigInt(event.args.toAmount.toString());
				}
			}

			logger.info('✅ DCA executed successfully', {
				txHash: tx.hash,
				executionId,
				amountOut: amountOut.toString(),
				gasUsed: receipt.gasUsed?.toString?.() || '0'
			});

			return { txHash: tx.hash, executionId, amountOut } as any;
    } catch (error) {
      logger.error('❌ Failed to execute DCA', { error, params });
      throw error;
    }
  }

  /**
   * Execute portfolio rebalancing
   * 
   * @param params - Rebalance execution parameters
   * @returns Transaction hash
   */
	async executeRebalance(params: RebalanceExecutionParams): Promise<{ txHash: string; executionId: string; amountsOut?: bigint[] }> {
		try {
			logger.info('⚖️ Executing portfolio rebalance', params);

			let tx: any;

			// Try to call the contract with different possible signatures
			if (typeof (this.contract as any).executeRebalance === 'function') {
				try {
					// Preferred: user + targets (if provided)
					if ((params as any).targets) {
						tx = await (this.contract as any).executeRebalance(params.user, (params as any).targets);
					} else if (params.tokensFrom && params.tokensTo && params.amountsFrom) {
						// Some contract wrappers may accept arrays of trades; try passing arrays
						tx = await (this.contract as any).executeRebalance(
							params.user || params.permissionId || '',
							params.tokensFrom,
							params.tokensTo,
							params.amountsFrom
						);
					} else {
						// Last-resort: call with user only
						tx = await (this.contract as any).executeRebalance(params.user || params.permissionId || '');
					}
				} catch (e) {
					// If call failed, rethrow
					throw e;
				}
			} else {
				throw new Error('executeRebalance not supported by contract');
			}

			const receipt = await tx.wait();

			// Parse RebalanceExecuted event if present
			const event = receipt.logs.find((log: any) => log.fragment?.name === 'RebalanceExecuted');
			const executionId = event?.args?.executionId || '';

			// Try to extract amountsOut if available in event
			let amountsOut: bigint[] = [];
			if (event && event.args && event.args.toAmount) {
				try {
					const a = event.args.toAmount;
					if (Array.isArray(a)) {
						amountsOut = a.map((v: any) => BigInt(v.toString()));
					} else {
						amountsOut = [BigInt(a.toString())];
					}
				} catch (e) {
					// ignore
				}
			}

			logger.info('✅ Rebalance executed successfully', {
				txHash: tx.hash,
				executionId,
				gasUsed: receipt.gasUsed?.toString?.() || '0'
			});

			return { txHash: tx.hash, executionId, amountsOut };
		} catch (error) {
			logger.error('❌ Failed to execute rebalance', { error, params });
			throw error;
		}
	}

  /**
   * Get delegation information
   * 
   * @param delegationId - Delegation ID to query
   * @returns Delegation information
   */
  async getDelegationInfo(delegationId: string): Promise<DelegationInfo> {
    try {
	const result = await (this.contract as any)['getDelegationInfo'](delegationId);
      
      return {
        parentPermissionId: result.parentPermissionId,
        delegatee: result.delegatee,
        allowance: result.allowance,
        spent: result.spent,
        isActive: result.isActive,
        createdAt: result.createdAt
      };
    } catch (error) {
      logger.error('❌ Failed to get delegation info', { error, delegationId });
      throw error;
    }
  }

	/**
	 * Get permission info wrapper used by backend APIs.
	 * Attempts to call contract methods available in ABI and returns
	 * a normalized object used by the rest of the application.
	 */
	async getPermissionInfo(permissionId: string): Promise<{
		owner: string;
		allowance: bigint;
		spent: bigint;
		resetTime: bigint;
		timeWindow: bigint;
	} | null> {
		try {
			// Try common function names that may exist on the contract
			if (typeof (this.contract as any).getDelegationInfo === 'function') {
				const info = await (this.contract as any).getDelegationInfo(permissionId);
				return {
					owner: info.delegatee || '',
					allowance: BigInt(info.allowance ?? 0),
					spent: BigInt(info.spent ?? 0),
					resetTime: BigInt(info.createdAt ?? 0),
					timeWindow: BigInt(0)
				};
			}

			// Fallback: attempt to read delegations mapping
			if (typeof (this.contract as any).delegations === 'function') {
				const info = await (this.contract as any).delegations(permissionId);
				return {
					owner: info.delegatee || '',
					allowance: BigInt(info.allowance ?? 0),
					spent: BigInt(info.spent ?? 0),
					resetTime: BigInt(info.createdAt ?? 0),
					timeWindow: BigInt(0)
				};
			}

			return null;
		} catch (error) {
			logger.warn('Failed to get permission info from contract wrapper', { error, permissionId });
			return null;
		}
	}

	/**
	 * Check whether a permission allows executing a given amount.
	 * Uses available contract methods where possible, otherwise returns false.
	 */
	async checkPermission(permissionId: string, userAddress: string, amount: bigint): Promise<boolean> {
		try {
			if (typeof (this.contract as any).checkDelegationAllowance === 'function') {
				return await (this.contract as any).checkDelegationAllowance(permissionId, amount);
			}
			// No on-chain check available — optimistic false
			return false;
		} catch (error) {
			logger.warn('Failed to check permission on contract', { error, permissionId });
			return false;
		}
	}

	/**
	 * Revoke permission wrapper. If the contract supports a revoke, call it.
	 * Returns transaction hash string or empty string on fallback.
	 */
	async revokePermission(permissionId: string): Promise<string> {
		try {
			if (typeof (this.contract as any).revokePermission === 'function') {
				const tx = await (this.contract as any).revokePermission(permissionId);
				const receipt = await tx.wait();
				return tx.hash;
			}
			// No revoke exposed — return empty string
			return '';
		} catch (error) {
			logger.warn('Failed to revoke permission on contract', { error, permissionId });
			throw error;
		}
	}

	/**
	 * Get user permissions wrapper. Returns array of permission IDs if available.
	 */
	async getUserPermissions(userAddress: string): Promise<string[]> {
		try {
			if (typeof (this.contract as any).getUserPermissions === 'function') {
				return await (this.contract as any).getUserPermissions(userAddress);
			}
			return [];
		} catch (error) {
			logger.warn('Failed to get user permissions from contract', { error, userAddress });
			return [];
		}
	}

  /**
   * Check if a delegation has sufficient allowance
   * 
   * @param delegationId - Delegation ID to check
   * @param amount - Amount to check
   * @returns Whether delegation has sufficient allowance
   */
  async checkDelegationAllowance(delegationId: string, amount: bigint): Promise<boolean> {
    try {
	return await (this.contract as any)['checkDelegationAllowance'](delegationId, amount);
    } catch (error) {
      logger.error('❌ Failed to check delegation allowance', { error, delegationId, amount: amount.toString() });
      return false;
    }
  }

  /**
   * Get remaining allowance for a delegation
   * 
   * @param delegationId - Delegation ID to check
   * @returns Remaining allowance amount
   */
  async getDelegationRemainingAllowance(delegationId: string): Promise<bigint> {
    try {
	return await (this.contract as any)['getDelegationRemainingAllowance'](delegationId);
    } catch (error) {
      logger.error('❌ Failed to get delegation remaining allowance', { error, delegationId });
      throw error;
    }
  }

  /**
   * Use a delegation
   * 
   * @param delegationId - Delegation ID to use
   * @param amount - Amount to use
   * @returns Transaction hash
   */
  async useDelegation(delegationId: string, amount: bigint): Promise<string> {
    try {
      logger.info('🔑 Using delegation', { delegationId, amount: amount.toString() });

	const tx = await (this.contract as any)['useDelegation'](delegationId, amount);
      const receipt = await tx.wait();

      logger.info('✅ Delegation used successfully', {
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      });

      return tx.hash;
    } catch (error) {
      logger.error('❌ Failed to use delegation', { error, delegationId, amount: amount.toString() });
      throw error;
    }
  }

  /**
   * Validate asset weights (check if they sum to 100%)
   * 
   * @param targets - Asset weights to validate
   * @returns Whether weights are valid
   */
  async validateAssetWeights(targets: AssetWeight[]): Promise<boolean> {
    try {
	return await (this.contract as any)['validateAssetWeights'](targets);
    } catch (error) {
      logger.error('❌ Failed to validate asset weights', { error, targets });
      return false;
    }
  }
}

// Export singleton instance
export const agentContract = new AgentContract();