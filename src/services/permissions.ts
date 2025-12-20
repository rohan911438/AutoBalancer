/**
 * ERC-7715 Permission Management Service
 * 
 * Handles creation, validation, and management of MetaMask Advanced Permissions
 * for automated DCA and rebalancing operations
 */

import { ethers } from 'ethers';
import {
  ERC7715Permission,
  PermissionCaveat,
  DCAPermissionConfig,
  PermissionMetadata,
  PermissionRequestParams,
  PermissionRequestResult,
  PermissionStatus,
  PermissionValidationResult,
  MetaMaskPermissionResponse
} from '../types/permissions';

/**
 * ERC-7715 Permission Manager
 * Core service for managing advanced permissions
 */
export class PermissionManager {
  private static instance: PermissionManager;
  
  // Agent contract address (should match backend config)
  private readonly AGENT_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890'; // TODO: Use actual deployed address
  
  private constructor() {}

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  /**
   * Create ERC-7715 permission object for DCA plan
   */
  createDCAPermission(config: DCAPermissionConfig): ERC7715Permission {
    const caveats: PermissionCaveat[] = [
      // ERC-20 allowance caveat
      {
        type: 'erc20-allowance',
        value: {
          token: config.tokenFrom,
          amount: this.calculateTotalAllowance(config.amountPerPeriod, config.duration, config.period)
        }
      },
      // Time window caveat
      {
        type: 'time-window',
        value: {
          startTime: config.startTime,
          endTime: config.endTime,
          period: config.period,
          maxPerPeriod: config.amountPerPeriod
        }
      },
      // Target contract caveat (restrict to agent contract)
      {
        type: 'target-contract',
        value: {
          target: config.agentAddress
        }
      },
      // Swap-only caveat (only allow DCA executions)
      {
        type: 'swap-only',
        value: {
          allowedActions: ['executeDCA'],
          allowedTokens: [config.tokenFrom, config.tokenTo]
        }
      }
    ];

    return {
      invoker: config.agentAddress,
      caveats
    };
  }

  /**
   * Request permission from MetaMask
   */
  async requestPermission(params: PermissionRequestParams): Promise<PermissionRequestResult> {
    try {
      const { config } = params;
      
      // Validate inputs
      if (!this.validatePermissionConfig(config)) {
        return {
          success: false,
          error: 'Invalid permission configuration'
        };
      }

      // Check if MetaMask is available
      if (!window.ethereum) {
        return {
          success: false,
          error: 'MetaMask not detected. Please install MetaMask to continue.'
        };
      }

      // Create permission object
      const permission = this.createDCAPermission(config);

      // Request permission through MetaMask SDK
      const permissionResponse = await this.requestMetaMaskPermission(permission);
      
      if (!permissionResponse.success) {
        return {
          success: false,
          error: permissionResponse.error || 'Permission request failed'
        };
      }

      // Create permission metadata
      const metadata: PermissionMetadata = {
        id: permissionResponse.permissionId!,
        userAddress: config.userAddress,
        agentAddress: config.agentAddress,
        tokenAddress: config.tokenFrom,
        totalAllowance: this.calculateTotalAllowance(config.amountPerPeriod, config.duration, config.period),
        spentAmount: '0',
        remainingAllowance: this.calculateTotalAllowance(config.amountPerPeriod, config.duration, config.period),
        maxPerPeriod: config.amountPerPeriod,
        periodDuration: this.getPeriodDuration(config.period),
        startTime: config.startTime,
        endTime: config.endTime,
        createdAt: Date.now(),
        status: 'granted' as PermissionStatus,
        txHash: permissionResponse.txHash
      };

      // Store permission locally
      this.storePermission(metadata);

      return {
        success: true,
        permissionId: metadata.id,
        metadata,
        txHash: permissionResponse.txHash
      };

    } catch (error) {
      console.error('Permission request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Request permission through MetaMask SDK
   */
  private async requestMetaMaskPermission(permission: ERC7715Permission): Promise<{
    success: boolean;
    permissionId?: string;
    txHash?: string;
    error?: string;
  }> {
    try {
      // Convert permission to MetaMask format
      const metamaskRequest = {
        method: 'wallet_requestPermissions',
        params: [
          {
            'permission:invoker': {
              caveats: permission.caveats.map(caveat => ({
                type: caveat.type,
                value: caveat.value
              }))
            }
          }
        ]
      };

      // Request permission from MetaMask
      const response: MetaMaskPermissionResponse[] = await window.ethereum.request(metamaskRequest);
      
      if (response && response.length > 0) {
        const grantedPermission = response[0];
        
        return {
          success: true,
          permissionId: grantedPermission.permissionId,
          // txHash will be available after the permission transaction
        };
      }

      return {
        success: false,
        error: 'No permission granted'
      };

    } catch (error) {
      console.error('MetaMask permission request failed:', error);
      
      if ((error as any)?.code === 4001) {
        return {
          success: false,
          error: 'User rejected the permission request'
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Permission request failed'
      };
    }
  }

  /**
   * Validate permission configuration
   */
  private validatePermissionConfig(config: DCAPermissionConfig): boolean {
    try {
      // Validate addresses
      if (!ethers.isAddress(config.userAddress) || 
          !ethers.isAddress(config.agentAddress) || 
          !ethers.isAddress(config.tokenFrom)) {
        return false;
      }

      // Validate amounts
      if (!config.amountPerPeriod || BigInt(config.amountPerPeriod) <= 0) {
        return false;
      }

      // Validate time windows
      if (config.startTime >= config.endTime) {
        return false;
      }

      // Validate period
      if (!['daily', 'weekly', 'monthly'].includes(config.period)) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate total allowance based on period and duration
   */
  private calculateTotalAllowance(amountPerPeriod: string, durationSeconds: number, period: string): string {
    const periodDuration = this.getPeriodDuration(period);
    const totalPeriods = Math.ceil(durationSeconds / periodDuration);
    const totalAllowance = BigInt(amountPerPeriod) * BigInt(totalPeriods);
    return totalAllowance.toString();
  }

  /**
   * Get period duration in seconds
   */
  private getPeriodDuration(period: string): number {
    switch (period) {
      case 'daily':
        return 24 * 60 * 60; // 86400 seconds
      case 'weekly':
        return 7 * 24 * 60 * 60; // 604800 seconds
      case 'monthly':
        return 30 * 24 * 60 * 60; // 2592000 seconds
      default:
        return 24 * 60 * 60; // Default to daily
    }
  }

  /**
   * Store permission in local storage
   */
  private storePermission(metadata: PermissionMetadata): void {
    try {
      const stored = this.getStoredPermissions();
      stored[metadata.id] = metadata;
      localStorage.setItem('autobalancer_permissions', JSON.stringify(stored));
    } catch (error) {
      console.error('Failed to store permission:', error);
    }
  }

  /**
   * Get all stored permissions
   */
  getStoredPermissions(): Record<string, PermissionMetadata> {
    try {
      const stored = localStorage.getItem('autobalancer_permissions');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to load stored permissions:', error);
      return {};
    }
  }

  /**
   * Get specific permission by ID
   */
  getPermission(permissionId: string): PermissionMetadata | null {
    const permissions = this.getStoredPermissions();
    return permissions[permissionId] || null;
  }

  /**
   * Get permissions for a specific user
   */
  getUserPermissions(userAddress: string): PermissionMetadata[] {
    const permissions = this.getStoredPermissions();
    return Object.values(permissions).filter(p => 
      p.userAddress.toLowerCase() === userAddress.toLowerCase()
    );
  }

  /**
   * Validate if permission is still valid
   */
  validatePermission(permissionId: string): PermissionValidationResult {
    const permission = this.getPermission(permissionId);
    
    if (!permission) {
      return {
        isValid: false,
        reason: 'Permission not found'
      };
    }

    const now = Date.now();

    // Check if expired
    if (permission.endTime && now > permission.endTime * 1000) {
      return {
        isValid: false,
        reason: 'Permission has expired'
      };
    }

    // Check if revoked
    if (permission.status === 'revoked') {
      return {
        isValid: false,
        reason: 'Permission has been revoked'
      };
    }

    // Check if exhausted
    if (BigInt(permission.spentAmount) >= BigInt(permission.totalAllowance)) {
      return {
        isValid: false,
        reason: 'Permission allowance exhausted'
      };
    }

    return {
      isValid: true,
      remainingAllowance: permission.remainingAllowance,
      nextResetTime: this.calculateNextResetTime(permission)
    };
  }

  /**
   * Calculate next allowance reset time
   */
  private calculateNextResetTime(permission: PermissionMetadata): number {
    const now = Date.now();
    const periodMs = permission.periodDuration * 1000;
    const startTime = permission.startTime * 1000;
    
    // Calculate how many periods have passed
    const periodsPassed = Math.floor((now - startTime) / periodMs);
    
    // Next reset is at the start of the next period
    return startTime + (periodsPassed + 1) * periodMs;
  }

  /**
   * Revoke a permission
   */
  async revokePermission(permissionId: string): Promise<boolean> {
    try {
      const permission = this.getPermission(permissionId);
      if (!permission) {
        return false;
      }

      // Update local storage
      const permissions = this.getStoredPermissions();
      permissions[permissionId].status = 'revoked';
      localStorage.setItem('autobalancer_permissions', JSON.stringify(permissions));

      // TODO: Call MetaMask to revoke the permission on-chain
      // await window.ethereum.request({
      //   method: 'wallet_revokePermissions',
      //   params: [{ permissionId }]
      // });

      return true;
    } catch (error) {
      console.error('Failed to revoke permission:', error);
      return false;
    }
  }

  /**
   * Update permission usage (called after successful execution)
   */
  updatePermissionUsage(permissionId: string, amountSpent: string): void {
    try {
      const permissions = this.getStoredPermissions();
      const permission = permissions[permissionId];
      
      if (permission) {
        const newSpentAmount = BigInt(permission.spentAmount) + BigInt(amountSpent);
        const newRemainingAllowance = BigInt(permission.totalAllowance) - newSpentAmount;
        
        permission.spentAmount = newSpentAmount.toString();
        permission.remainingAllowance = newRemainingAllowance.toString();
        permission.lastUsedAt = Date.now();
        
        // Check if exhausted
        if (newRemainingAllowance <= 0) {
          permission.status = 'exhausted';
        }
        
        localStorage.setItem('autobalancer_permissions', JSON.stringify(permissions));
      }
    } catch (error) {
      console.error('Failed to update permission usage:', error);
    }
  }
}

// Export singleton instance
export const permissionManager = PermissionManager.getInstance();