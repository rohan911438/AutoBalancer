/**
 * ERC-7715 Permission Types for AutoBalancer
 * 
 * Defines TypeScript interfaces for MetaMask Advanced Permissions
 * used in automated DCA and rebalancing operations
 */

/**
 * ERC-7715 Permission Caveat
 * Defines specific constraints and conditions for permission usage
 */
export interface PermissionCaveat {
  type: 'erc20-allowance' | 'time-window' | 'target-contract' | 'token-specific' | 'swap-only';
  value: {
    // For erc20-allowance caveat
    token?: string;
    amount?: string;
    // For time-window caveat
    startTime?: number;
    endTime?: number;
    period?: 'daily' | 'weekly' | 'monthly';
    maxPerPeriod?: string;
    // For target-contract caveat
    target?: string;
    // For swap-only caveat
    allowedActions?: string[];
    // For token-specific caveat
    allowedTokens?: string[];
  };
}

/**
 * ERC-7715 Permission Object
 * Complete permission structure for advanced permissions
 */
export interface ERC7715Permission {
  id?: string; // Generated after approval
  parentPermission?: string;
  invoker: string; // Agent contract address
  caveats: PermissionCaveat[];
  signature?: string; // User signature for the permission
}

/**
 * DCA Plan Permission Configuration
 * Specific permission configuration for DCA plans
 */
export interface DCAPermissionConfig {
  userAddress: string;
  agentAddress: string;
  tokenFrom: string;
  tokenTo: string;
  amountPerPeriod: string;
  period: 'daily' | 'weekly' | 'monthly';
  duration: number; // Duration in seconds
  startTime: number;
  endTime: number;
}

/**
 * Permission Status
 * Current status of an ERC-7715 permission
 */
export type PermissionStatus = 
  | 'pending'     // Permission request in progress
  | 'granted'     // Permission approved and active
  | 'denied'      // Permission request rejected
  | 'expired'     // Permission has expired
  | 'revoked'     // Permission has been revoked
  | 'exhausted';  // Permission allowance fully used

/**
 * Permission Metadata
 * Additional information about a permission
 */
export interface PermissionMetadata {
  id: string;
  userAddress: string;
  agentAddress: string;
  tokenAddress: string;
  totalAllowance: string;
  spentAmount: string;
  remainingAllowance: string;
  maxPerPeriod: string;
  periodDuration: number;
  startTime: number;
  endTime: number;
  lastUsedAt?: number;
  createdAt: number;
  status: PermissionStatus;
  txHash?: string; // Transaction hash when permission was granted
}

/**
 * Permission Request Parameters
 * Parameters for requesting a new permission
 */
export interface PermissionRequestParams {
  config: DCAPermissionConfig;
  planId?: string;
  description?: string;
}

/**
 * Permission Request Result
 * Result of a permission request operation
 */
export interface PermissionRequestResult {
  success: boolean;
  permissionId?: string;
  metadata?: PermissionMetadata;
  error?: string;
  txHash?: string;
}

/**
 * Permission Usage Event
 * Event data for permission usage tracking
 */
export interface PermissionUsageEvent {
  permissionId: string;
  userAddress: string;
  agentAddress: string;
  amount: string;
  tokenAddress: string;
  timestamp: number;
  txHash: string;
  type: 'dca-execution' | 'rebalance-execution';
  success: boolean;
  errorReason?: string;
}

/**
 * Permission Manager State
 * State interface for the permission management system
 */
export interface PermissionManagerState {
  permissions: Record<string, PermissionMetadata>;
  isLoading: boolean;
  error: string | null;
  activePermissionId: string | null;
}

/**
 * MetaMask Permission Response
 * Response structure from MetaMask SDK
 */
export interface MetaMaskPermissionResponse {
  parentCapability: string;
  caveats: PermissionCaveat[];
  permissionId: string;
  invoker: string;
}

/**
 * Permission Validation Result
 * Result of permission validation check
 */
export interface PermissionValidationResult {
  isValid: boolean;
  reason?: string;
  remainingAllowance?: string;
  nextResetTime?: number;
}