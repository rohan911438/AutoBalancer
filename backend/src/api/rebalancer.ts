import express from 'express';
import Joi from 'joi';
import { database, RebalancerConfig, AssetWeight } from '../services/database';
import { logger } from '../utils/logger';
import { getCurrentTimestamp } from '../utils/time';
import { isValidTokenAddress } from '../utils/tokens';

const router = express.Router();

/**
 * Validation schemas for rebalancer requests
 */
const assetWeightSchema = Joi.object({
  tokenAddress: Joi.string().required().custom((value, helpers) => {
    if (!isValidTokenAddress(value, true)) {
      return helpers.error('any.invalid');
    }
    return value;
  }, 'Token address validation'),
  targetWeight: Joi.number().min(0).max(100).required()
});

const createRebalancerSchema = Joi.object({
  userAddress: Joi.string().required().pattern(/^0x[a-fA-F0-9]{40}$/),
  assets: Joi.array().items(assetWeightSchema).min(2).max(10).required().custom((assets, helpers) => {
    // Check that weights sum to 100
    const totalWeight = assets.reduce((sum: number, asset: AssetWeight) => sum + asset.targetWeight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      return helpers.error('any.invalid', { message: 'Asset weights must sum to 100%' });
    }
    
    // Check for duplicate tokens
    const tokens = assets.map((asset: AssetWeight) => asset.tokenAddress.toLowerCase());
    if (new Set(tokens).size !== tokens.length) {
      return helpers.error('any.invalid', { message: 'Duplicate token addresses not allowed' });
    }
    
    return assets;
  }, 'Assets validation'),
  permissionId: Joi.string().required().pattern(/^0x[a-fA-F0-9]{64}$/),
  rebalanceThreshold: Joi.number().min(1).max(50).default(5)
});

const updateRebalancerSchema = Joi.object({
  assets: Joi.array().items(assetWeightSchema).min(2).max(10),
  rebalanceThreshold: Joi.number().min(1).max(50),
  isActive: Joi.boolean()
}).min(1);

/**
 * POST /api/rebalancer
 * Create a new rebalancer configuration
 */
router.post('/', async (req, res) => {
  try {
    const { error, value } = createRebalancerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    const { userAddress, assets, permissionId, rebalanceThreshold } = value;

    // Check if user already has an active rebalancer config
    const existingConfigs = await database.getRebalancerConfigs(userAddress);
    const activeConfig = existingConfigs.find(config => config.isActive);

    if (activeConfig) {
      return res.status(409).json({
        error: 'Active rebalancer exists',
        message: 'An active rebalancer configuration already exists',
        existingConfigId: activeConfig.id
      });
    }

    // Create the rebalancer config
    const currentTime = getCurrentTimestamp();
    const configData = {
      userAddress,
      assets,
      permissionId,
      rebalanceThreshold,
      lastRebalanceTime: 0,
      totalRebalances: 0,
      isActive: true
    };

    const createdConfig = await database.createRebalancerConfig(configData);

    logger.info('⚖️ Rebalancer config created', {
      configId: createdConfig.id,
      userAddress,
      assetsCount: assets.length,
      threshold: rebalanceThreshold
    });

    res.status(201).json({
      success: true,
      data: {
        config: createdConfig
      }
    });

  } catch (error) {
    logger.error('❌ Failed to create rebalancer config:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create rebalancer configuration'
    });
  }
});

/**
 * GET /api/rebalancer/:userAddress
 * Get rebalancer configuration for a user
 */
router.get('/:userAddress', async (req, res) => {
  try {
    const { userAddress } = req.params;
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        error: 'Invalid user address format'
      });
    }

    const configs = await database.getRebalancerConfigs(userAddress);
    const activeConfig = configs.find(config => config.isActive);

    res.json({
      success: true,
      data: {
        config: activeConfig || null,
        allConfigs: configs
      }
    });

  } catch (error) {
    logger.error('❌ Failed to retrieve rebalancer config:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve rebalancer configuration'
    });
  }
});

/**
 * PUT /api/rebalancer/:configId
 * Update a rebalancer configuration
 */
router.put('/:configId', async (req, res) => {
  try {
    const { configId } = req.params;
    
    const { error, value } = updateRebalancerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    const existingConfig = await database.getRebalancerConfig(configId);
    if (!existingConfig) {
      return res.status(404).json({
        error: 'Config not found',
        message: `Rebalancer config with ID ${configId} not found`
      });
    }

    const updatedConfig = await database.updateRebalancerConfig(configId, value);

    logger.info('✏️ Rebalancer config updated', {
      configId,
      updatedFields: Object.keys(value)
    });

    res.json({
      success: true,
      data: {
        config: updatedConfig
      }
    });

  } catch (error) {
    logger.error('❌ Failed to update rebalancer config:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update rebalancer configuration'
    });
  }
});

/**
 * DELETE /api/rebalancer/:configId
 * Delete a rebalancer configuration
 */
router.delete('/:configId', async (req, res) => {
  try {
    const { configId } = req.params;
    
    const existingConfig = await database.getRebalancerConfig(configId);
    if (!existingConfig) {
      return res.status(404).json({
        error: 'Config not found',
        message: `Rebalancer config with ID ${configId} not found`
      });
    }

    const deleted = await database.deleteRebalancerConfig(configId);

    if (deleted) {
      logger.info('🗑️ Rebalancer config deleted', { configId });
      res.json({
        success: true,
        message: 'Rebalancer configuration deleted successfully'
      });
    } else {
      res.status(500).json({
        error: 'Failed to delete config',
        message: 'Configuration deletion failed'
      });
    }

  } catch (error) {
    logger.error('❌ Failed to delete rebalancer config:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete rebalancer configuration'
    });
  }
});

export default router;