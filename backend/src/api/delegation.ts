import express from 'express';
import Joi from 'joi';
import { agentContract } from '../contracts/agent';
import { database } from '../services/database';
import { logger } from '../utils/logger';
import { getCurrentTimestamp, daysToSeconds } from '../utils/time';
import { config } from '../config';

const router = express.Router();

/**
 * Validation schema for delegation request
 */
const delegatePermissionSchema = Joi.object({
  parentPermissionId: Joi.string().required().pattern(/^0x[a-fA-F0-9]{64}$/),
  delegatedAllowance: Joi.string().required().pattern(/^\d+$/),
  timeWindow: Joi.alternatives().try(
    Joi.number().integer().positive(), // Time window in seconds
    Joi.string().pattern(/^\d+[dhm]$/) // Duration string like "30d", "12h", "45m"
  ).required(),
  userAddress: Joi.string().required().pattern(/^0x[a-fA-F0-9]{40}$/)
});

/**
 * POST /api/delegation
 * Delegate permission to the agent contract for automated trading
 */
router.post('/', async (req, res) => {
  try {
    const { error, value } = delegatePermissionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    const { parentPermissionId, delegatedAllowance, timeWindow, userAddress } = value;

    // Convert time window to seconds if it's a string
    let timeWindowSeconds: number;
    if (typeof timeWindow === 'string') {
      const match = timeWindow.match(/^(\d+)([dhm])$/);
      if (!match) {
        return res.status(400).json({
          error: 'Invalid time window format',
          message: 'Use format like "30d", "12h", "45m"'
        });
      }
      
      const value = parseInt(match[1]!, 10);
      const unit = match[2];
      
      switch (unit) {
        case 'd':
          timeWindowSeconds = value * 24 * 60 * 60;
          break;
        case 'h':
          timeWindowSeconds = value * 60 * 60;
          break;
        case 'm':
          timeWindowSeconds = value * 60;
          break;
        default:
          throw new Error(`Invalid time unit: ${unit}`);
      }
    } else {
      timeWindowSeconds = timeWindow;
    }

    // Delegate permission using the agent contract
    logger.info('🔐 Delegating permission to agent', {
      parentPermissionId,
      delegatedAllowance,
      timeWindowSeconds,
      userAddress
    });

    const result = await agentContract.delegatePermission(
      parentPermissionId,
      config.agentContractAddress, // Delegatee is the agent contract
      BigInt(delegatedAllowance),
      BigInt(timeWindowSeconds)
    );

    // Store permission metadata in database
    const currentTime = getCurrentTimestamp();
    const permissionMetadata = {
      permissionId: result.permissionId,
      userAddress,
      parentPermissionId,
      allowance: delegatedAllowance,
      spent: '0',
      timeWindow: timeWindowSeconds,
      resetTime: currentTime,
      delegatee: config.agentContractAddress,
      isActive: true
    };

    await database.createPermission(permissionMetadata);

    logger.info('✅ Permission delegated successfully', {
      permissionId: result.permissionId,
      txHash: result.txHash,
      userAddress
    });

    return res.status(201).json({
      success: true,
      data: {
        permissionId: result.permissionId,
        txHash: result.txHash,
        metadata: permissionMetadata
      }
    });

  } catch (error) {
    logger.error('❌ Failed to delegate permission:', error);
    return res.status(500).json({
      error: 'Delegation failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * POST /api/delegation/:permissionId/revoke
 * Revoke a delegated permission
 */
router.post('/:permissionId/revoke', async (req, res) => {
  try {
    const { permissionId } = req.params;
    
    // Validate permission ID format
    if (!/^0x[a-fA-F0-9]{64}$/.test(permissionId)) {
      return res.status(400).json({
        error: 'Invalid permission ID format'
      });
    }

    // Check if permission exists in our database
    const permission = await database.getPermission(permissionId);
    if (!permission) {
      return res.status(404).json({
        error: 'Permission not found',
        message: `Permission with ID ${permissionId} not found`
      });
    }

    // Revoke permission using the agent contract
    logger.info('🚫 Revoking permission', { permissionId });

    const txHash = await agentContract.revokePermission(permissionId);

    // Update permission status in database
    await database.updatePermission(permissionId, { isActive: false });

    logger.info('✅ Permission revoked successfully', {
      permissionId,
      txHash
    });

    return res.json({
      success: true,
      data: {
        permissionId,
        txHash,
        message: 'Permission revoked successfully'
      }
    });

  } catch (error) {
    logger.error('❌ Failed to revoke permission:', error);
    return res.status(500).json({
      error: 'Revocation failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * GET /api/delegation/:userAddress/permissions
 * Get all permissions for a user
 */
router.get('/:userAddress/permissions', async (req, res) => {
  try {
    const { userAddress } = req.params;
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        error: 'Invalid user address format'
      });
    }

    // Get permissions from database
    const permissions = await database.getPermissions(userAddress);

    // Also fetch from contract for comparison
    let contractPermissions: string[] = [];
    try {
      contractPermissions = await agentContract.getUserPermissions(userAddress);
    } catch (error) {
      logger.warn('Failed to fetch permissions from contract:', error);
    }

    logger.info('📋 Retrieved user permissions', {
      userAddress,
      dbCount: permissions.length,
      contractCount: contractPermissions.length
    });

    return res.json({
      success: true,
      data: {
        permissions,
        contractPermissions
      }
    });

  } catch (error) {
    logger.error('❌ Failed to retrieve permissions:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve permissions'
    });
  }
});

/**
 * GET /api/delegation/permission/:permissionId
 * Get detailed information about a specific permission
 */
router.get('/permission/:permissionId', async (req, res) => {
  try {
    const { permissionId } = req.params;
    
    if (!/^0x[a-fA-F0-9]{64}$/.test(permissionId)) {
      return res.status(400).json({
        error: 'Invalid permission ID format'
      });
    }

    // Get permission from database
    const dbPermission = await database.getPermission(permissionId);

    // Get permission info from contract
    let contractInfo = null;
    try {
      contractInfo = await agentContract.getPermissionInfo(permissionId);
    } catch (error) {
      logger.warn('Failed to fetch permission info from contract:', error);
    }

    if (!dbPermission && !contractInfo) {
      return res.status(404).json({
        error: 'Permission not found',
        message: `Permission with ID ${permissionId} not found`
      });
    }

    return res.json({
      success: true,
      data: {
        database: dbPermission,
        contract: contractInfo ? {
          owner: contractInfo.owner,
          allowance: contractInfo.allowance.toString(),
          spent: contractInfo.spent.toString(),
          resetTime: Number(contractInfo.resetTime),
          timeWindow: Number(contractInfo.timeWindow)
        } : null
      }
    });

  } catch (error) {
    logger.error('❌ Failed to retrieve permission info:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve permission information'
    });
  }
});

export default router;