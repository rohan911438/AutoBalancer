import express from 'express';
import { database } from '../services/database';
import { agentContract } from '../contracts/agent';
import { logger } from '../utils/logger';
import { formatTimestamp } from '../utils/time';
import { formatTokenAmount } from '../utils/tokens';

const router = express.Router();

/**
 * GET /api/permissions/:userAddress
 * Get permission metadata for a user with enhanced information
 */
router.get('/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    
    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        error: 'Invalid user address format'
      });
    }

    // Get permissions from database
    const dbPermissions = await database.getPermissions(userAddress);
    
    // Enhance permissions with contract data and formatting
    const enhancedPermissions = await Promise.all(
      dbPermissions.map(async (permission) => {
        let contractInfo = null;
        let utilization = 0;
        let isExpired = false;
        let timeUntilReset = 0;
        
        try {
          // Get real-time info from contract
          contractInfo = await agentContract.getPermissionInfo(permission.permissionId);
          
          // Calculate utilization percentage
          const spent = Number(contractInfo.spent);
          const allowance = Number(contractInfo.allowance);
          utilization = allowance > 0 ? (spent / allowance) * 100 : 0;
          
          // Check if permission has expired
          const now = Math.floor(Date.now() / 1000);
          const resetTime = Number(contractInfo.resetTime);
          const timeWindow = Number(contractInfo.timeWindow);
          const nextResetTime = resetTime + timeWindow;
          
          isExpired = now > nextResetTime;
          timeUntilReset = Math.max(0, nextResetTime - now);
          
        } catch (error) {
          logger.warn('Failed to get contract info for permission:', {
            permissionId: permission.permissionId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
        
        return {
          ...permission,
          contractInfo: contractInfo ? {
            owner: contractInfo.owner,
            allowance: contractInfo.allowance.toString(),
            spent: contractInfo.spent.toString(),
            resetTime: Number(contractInfo.resetTime),
            timeWindow: Number(contractInfo.timeWindow)
          } : null,
          computed: {
            utilizationPercent: Math.round(utilization * 100) / 100,
            isExpired,
            timeUntilReset,
            formattedResetTime: formatTimestamp(permission.resetTime),
            formattedAllowance: formatTokenAmount(BigInt(permission.allowance), 18),
            formattedSpent: formatTokenAmount(BigInt(permission.spent), 18)
          }
        };
      })
    );

    // Calculate summary statistics
    const summary = {
      total: enhancedPermissions.length,
      active: enhancedPermissions.filter(p => p.isActive).length,
      expired: enhancedPermissions.filter(p => p.computed.isExpired).length,
      highUtilization: enhancedPermissions.filter(p => p.computed.utilizationPercent > 80).length
    };

    logger.info('📊 Retrieved permission metadata', {
      userAddress,
      total: summary.total,
      active: summary.active
    });

    return res.json({
      success: true,
      data: {
        permissions: enhancedPermissions,
        summary
      }
    });

  } catch (error) {
    logger.error('❌ Failed to retrieve permission metadata:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve permission metadata'
    });
  }
});

/**
 * GET /api/permissions/permission/:permissionId/status
 * Get detailed status information for a specific permission
 */
router.get('/permission/:permissionId/status', async (req, res) => {
  try {
    const { permissionId } = req.params;
    
    if (!/^0x[a-fA-F0-9]{64}$/.test(permissionId)) {
      return res.status(400).json({
        error: 'Invalid permission ID format'
      });
    }

    // Get permission from database
    const dbPermission = await database.getPermission(permissionId);
    if (!dbPermission) {
      return res.status(404).json({
        error: 'Permission not found',
        message: `Permission with ID ${permissionId} not found`
      });
    }

    // Get real-time contract information
    const contractInfo = await agentContract.getPermissionInfo(permissionId);
    
    // Calculate detailed status
    const now = Math.floor(Date.now() / 1000);
    const allowance = Number(contractInfo.allowance);
    const spent = Number(contractInfo.spent);
    const resetTime = Number(contractInfo.resetTime);
    const timeWindow = Number(contractInfo.timeWindow);
    const nextResetTime = resetTime + timeWindow;
    
    const remaining = Math.max(0, allowance - spent);
    const utilizationPercent = allowance > 0 ? (spent / allowance) * 100 : 0;
    const isExpired = now > nextResetTime;
    const timeUntilReset = Math.max(0, nextResetTime - now);
    const canExecute = remaining > 0 && !isExpired && dbPermission.isActive;
    
    // Determine status
    let status = 'active';
    if (!dbPermission.isActive) {
      status = 'revoked';
    } else if (isExpired) {
      status = 'expired';
    } else if (remaining === 0) {
      status = 'exhausted';
    } else if (utilizationPercent > 90) {
      status = 'nearly_exhausted';
    }

    const statusInfo = {
      status,
      canExecute,
      allowance: allowance.toString(),
      spent: spent.toString(),
      remaining: remaining.toString(),
      utilizationPercent: Math.round(utilizationPercent * 100) / 100,
      isExpired,
      timeUntilReset,
      nextResetTime,
      formattedNextReset: formatTimestamp(nextResetTime),
      isActive: dbPermission.isActive
    };

    return res.json({
      success: true,
      data: {
        permissionId,
        statusInfo,
        metadata: dbPermission
      }
    });

  } catch (error) {
    logger.error('❌ Failed to get permission status:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve permission status'
    });
  }
});

/**
 * GET /api/permissions/check/:permissionId/:amount
 * Check if a permission is valid for a specific amount
 */
router.get('/check/:permissionId/:amount', async (req, res) => {
  try {
    const { permissionId, amount } = req.params;
    
    if (!/^0x[a-fA-F0-9]{64}$/.test(permissionId)) {
      return res.status(400).json({
        error: 'Invalid permission ID format'
      });
    }

    if (!/^\d+$/.test(amount)) {
      return res.status(400).json({
        error: 'Invalid amount format'
      });
    }

    // Get permission metadata
    const permission = await database.getPermission(permissionId);
    if (!permission) {
      return res.status(404).json({
        error: 'Permission not found'
      });
    }

    // Check permission with contract
    const isValid = await agentContract.checkPermission(
      permissionId,
      permission.userAddress,
      BigInt(amount)
    );

    // Get additional context
    const contractInfo = await agentContract.getPermissionInfo(permissionId);
    const remaining = Number(contractInfo.allowance) - Number(contractInfo.spent);
    
    const checkResult = {
      isValid,
      requested: amount,
      remaining: remaining.toString(),
      canExecute: isValid && permission.isActive,
      reason: isValid 
        ? 'Permission is valid' 
        : remaining < Number(amount) 
          ? 'Insufficient allowance remaining'
          : 'Permission check failed'
    };

    return res.json({
      success: true,
      data: checkResult
    });

  } catch (error) {
    logger.error('❌ Failed to check permission:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to check permission'
    });
  }
});

/**
 * GET /api/permissions/stats
 * Get global permission statistics (placeholder for analytics)
 */
router.get('/stats', async (req, res) => {
  try {
    // Get all permissions for global stats
    const allPermissions = await database.getPermissions();
    
    const stats = {
      totalPermissions: allPermissions.length,
      activePermissions: allPermissions.filter(p => p.isActive).length,
      uniqueUsers: new Set(allPermissions.map(p => p.userAddress)).size,
      totalAllowance: allPermissions.reduce((sum, p) => sum + Number(p.allowance), 0).toString(),
      totalSpent: allPermissions.reduce((sum, p) => sum + Number(p.spent), 0).toString(),
      averageUtilization: 0 // Would calculate if allowances > 0
    };

    // Calculate average utilization
    const permissionsWithUsage = allPermissions.filter(p => Number(p.allowance) > 0);
    if (permissionsWithUsage.length > 0) {
      const totalUtilization = permissionsWithUsage.reduce((sum, p) => {
        return sum + (Number(p.spent) / Number(p.allowance));
      }, 0);
      stats.averageUtilization = Math.round((totalUtilization / permissionsWithUsage.length) * 10000) / 100;
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    logger.error('❌ Failed to get permission stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve permission statistics'
    });
  }
});

export default router;