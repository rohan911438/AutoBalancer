import { ethers, Contract } from 'ethers';

/**
 * AutoBalancer Agent Contract Configuration
 * Deployed on Ethereum Sepolia Testnet
 */
export const AGENT_CONTRACT_ADDRESS = '0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815';
export const SEPOLIA_CHAIN_ID = 11155111;

/**
 * AutoBalancer Agent Contract ABI
 * Matches the deployed contract exactly
 */
export const AGENT_CONTRACT_ABI = [
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
] as const;

/**
 * Type definitions for contract interactions
 */
export interface AssetWeight {
  token: string;
  targetPercent: bigint;
  currentAmount: bigint;
  targetAmount: bigint;
}

export interface DelegationInfo {
  parentPermissionId: string;
  delegatee: string;
  allowance: bigint;
  spent: bigint;
  isActive: boolean;
  createdAt: bigint;
}

export interface ContractInfo {
  name: string;
  version: string;
  description: string;
}

/**
 * AgentContract class for frontend interactions
 */
export class AgentContract {
  private contract: Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    // Initialize when needed
  }

  /**
   * Initialize the contract with a provider/signer
   * @param provider - Ethereum provider (from wallet connection)
   */
  async initialize(provider: ethers.BrowserProvider) {
    this.provider = provider;
    this.signer = await provider.getSigner();
    this.contract = new ethers.Contract(AGENT_CONTRACT_ADDRESS, AGENT_CONTRACT_ABI, this.signer);
  }

  /**
   * Check if contract is initialized
   */
  private ensureInitialized() {
    if (!this.contract) {
      throw new Error('Contract not initialized. Call initialize() first.');
    }
  }

  /**
   * Get contract information
   */
  async getContractInfo(): Promise<ContractInfo> {
    this.ensureInitialized();
    const [name, version, description] = await this.contract!.getContractInfo();
    return { name, version, description };
  }

  /**
   * Execute DCA (simulation for hackathon)
   */
  async executeDCA(
    user: string,
    tokenFrom: string,
    tokenTo: string,
    amount: bigint
  ): Promise<{ txHash: string; executionId: string }> {
    this.ensureInitialized();
    
    const tx = await this.contract!.executeDCA(user, tokenFrom, tokenTo, amount);
    const receipt = await tx.wait();
    
    // Extract execution ID from events
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'DCAExecuted');
    const executionId = event?.args?.executionId || '';
    
    return { txHash: tx.hash, executionId };
  }

  /**
   * Execute rebalance (simulation for hackathon)
   */
  async executeRebalance(
    user: string,
    targets: AssetWeight[]
  ): Promise<{ txHash: string; executionId: string }> {
    this.ensureInitialized();
    
    const tx = await this.contract!.executeRebalance(user, targets);
    const receipt = await tx.wait();
    
    // Extract execution ID from events
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'RebalanceExecuted');
    const executionId = event?.args?.executionId || '';
    
    return { txHash: tx.hash, executionId };
  }

  /**
   * Delegate permission to another address
   */
  async delegatePermission(
    parentPermissionId: string,
    delegatee: string,
    allowance: bigint
  ): Promise<{ txHash: string; delegationId: string }> {
    this.ensureInitialized();
    
    const tx = await this.contract!.delegatePermission(parentPermissionId, delegatee, allowance);
    const receipt = await tx.wait();
    
    // Extract delegation ID from events
    const event = receipt.logs.find((log: any) => log.fragment?.name === 'PermissionDelegated');
    const delegationId = event?.args?.delegationId || '';
    
    return { txHash: tx.hash, delegationId };
  }

  /**
   * Get delegation information
   */
  async getDelegationInfo(delegationId: string): Promise<DelegationInfo> {
    this.ensureInitialized();
    const result = await this.contract!.getDelegationInfo(delegationId);
    
    return {
      parentPermissionId: result.parentPermissionId,
      delegatee: result.delegatee,
      allowance: result.allowance,
      spent: result.spent,
      isActive: result.isActive,
      createdAt: result.createdAt
    };
  }

  /**
   * Check delegation allowance
   */
  async checkDelegationAllowance(delegationId: string, amount: bigint): Promise<boolean> {
    this.ensureInitialized();
    return await this.contract!.checkDelegationAllowance(delegationId, amount);
  }

  /**
   * Get remaining allowance for a delegation
   */
  async getDelegationRemainingAllowance(delegationId: string): Promise<bigint> {
    this.ensureInitialized();
    return await this.contract!.getDelegationRemainingAllowance(delegationId);
  }

  /**
   * Use delegation
   */
  async useDelegation(delegationId: string, amount: bigint): Promise<string> {
    this.ensureInitialized();
    const tx = await this.contract!.useDelegation(delegationId, amount);
    await tx.wait();
    return tx.hash;
  }

  /**
   * Validate asset weights
   */
  async validateAssetWeights(targets: AssetWeight[]): Promise<boolean> {
    this.ensureInitialized();
    return await this.contract!.validateAssetWeights(targets);
  }

  /**
   * Get the contract address
   */
  getContractAddress(): string {
    return AGENT_CONTRACT_ADDRESS;
  }

  /**
   * Get the chain ID
   */
  getChainId(): number {
    return SEPOLIA_CHAIN_ID;
  }
}

// Export a singleton instance
export const agentContract = new AgentContract();