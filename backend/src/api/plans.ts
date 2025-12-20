import express from 'express';
import Joi from 'joi';
import { database, DcaPlan } from '../services/database';
import { logger } from '../utils/logger';
import { TimePeriod, parseDurationToSeconds, getCurrentTimestamp } from '../utils/time';
import { isValidTokenAddress, isValidTradingPair } from '../utils/tokens';

const router = express.Router();

/**
 * Validation schemas for DCA plan requests
 */
const createPlanSchema = Joi.object({
  userAddress: Joi.string().required().custom((value, helpers) => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }, 'Ethereum address validation'),
  
  tokenFrom: Joi.string().required().custom((value, helpers) => {
    if (!isValidTokenAddress(value, true)) {
      return helpers.error('any.invalid');
    }
    return value;
  }, 'Token address validation'),
  
  tokenTo: Joi.string().required().custom((value, helpers) => {
    if (!isValidTokenAddress(value, true)) {
      return helpers.error('any.invalid');
    }
    return value;
  }, 'Token address validation'),
  
  amountPerPeriod: Joi.string().required().pattern(/^\d+$/),
  
  period: Joi.string().valid(...Object.values(TimePeriod)).required(),
  
  duration: Joi.alternatives().try(
    Joi.number().integer().positive(), // Duration in seconds
    Joi.string().pattern(/^\d+[dhm]$/) // Duration string like "30d", "12h", "45m"
  ).required(),
  
  permissionId: Joi.string().required().pattern(/^0x[a-fA-F0-9]{64}$/)
});

const updatePlanSchema = Joi.object({
  amountPerPeriod: Joi.string().pattern(/^\d+$/),
  period: Joi.string().valid(...Object.values(TimePeriod)),
  duration: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().pattern(/^\d+[dhm]$/)
  ),
  isActive: Joi.boolean()
}).min(1);

/**
 * POST /api/plans
 * Create a new DCA plan
 */
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createPlanSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    const { userAddress, tokenFrom, tokenTo, amountPerPeriod, period, duration, permissionId } = value;

    // Validate trading pair
    if (!isValidTradingPair(tokenFrom, tokenTo)) {
      return res.status(400).json({
        error: 'Invalid trading pair',
        message: 'Cannot trade the same token or invalid token addresses'
      });
    }

    // Convert duration to seconds if it's a string
    const durationSeconds = typeof duration === 'string' ? parseDurationToSeconds(duration) : duration;

    // Check if user already has an active plan for the same trading pair
    const existingPlans = await database.getDcaPlans(userAddress);
    const conflictingPlan = existingPlans.find(plan => 
      plan.isActive && 
      plan.tokenFrom.toLowerCase() === tokenFrom.toLowerCase() &&
      plan.tokenTo.toLowerCase() === tokenTo.toLowerCase()
    );

    if (conflictingPlan) {
      return res.status(409).json({
        error: 'Conflicting plan exists',
        message: 'An active DCA plan already exists for this trading pair',
        existingPlanId: conflictingPlan.id
      });
    }

    // Create the DCA plan
    const currentTime = getCurrentTimestamp();
    const planData = {
      userAddress,
      tokenFrom,
      tokenTo,
      amountPerPeriod,
      period: period as TimePeriod,
      duration: durationSeconds,
      permissionId,
      startTime: currentTime,
      lastExecutionTime: 0, // Will be updated on first execution
      totalExecutions: 0,
      totalAmountSpent: '0',
      isActive: true
    };

    const createdPlan = await database.createDcaPlan(planData);

    logger.info('📝 DCA plan created successfully', {
      planId: createdPlan.id,
      userAddress,
      tokenPair: `${tokenFrom} → ${tokenTo}`,
      amountPerPeriod,
      period
    });

    return res.status(201).json({
      success: true,
      data: {
        plan: createdPlan
      }
    });

  } catch (error) {
    logger.error('❌ Failed to create DCA plan:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create DCA plan'
    });
  }
});

/**
 * GET /api/plans/:userAddress
 * Get all DCA plans for a user
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

    // Get query parameters
    const { active, limit = '100', offset = '0' } = req.query;
    const isActiveFilter = active === 'true' ? true : active === 'false' ? false : undefined;
    const limitNum = Math.min(parseInt(limit as string, 10), 1000); // Max 1000
    const offsetNum = Math.max(parseInt(offset as string, 10), 0);

    // Fetch plans
    let plans = await database.getDcaPlans(userAddress);
    
    // Apply active filter if specified
    if (isActiveFilter !== undefined) {
      plans = plans.filter(plan => plan.isActive === isActiveFilter);
    }

    // Apply pagination
    const total = plans.length;
    const paginatedPlans = plans.slice(offsetNum, offsetNum + limitNum);

    logger.info('📋 Retrieved DCA plans', {
      userAddress,
      total,
      returned: paginatedPlans.length,
      activeFilter: isActiveFilter
    });

    return res.json({
      success: true,
      data: {
        plans: paginatedPlans,
        pagination: {
          total,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < total
        }
      }
    });

  } catch (error) {
    logger.error('❌ Failed to retrieve DCA plans:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve DCA plans'
    });
  }
});

/**
 * GET /api/plans/plan/:planId
 * Get a specific DCA plan by ID
 */
router.get('/plan/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    
    const plan = await database.getDcaPlan(planId);
    
    if (!plan) {
      return res.status(404).json({
        error: 'Plan not found',
        message: `DCA plan with ID ${planId} not found`
      });
    }

    logger.info('📄 Retrieved DCA plan', { planId });

    return res.json({
      success: true,
      data: {
        plan
      }
    });

  } catch (error) {
    logger.error('❌ Failed to retrieve DCA plan:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve DCA plan'
    });
  }
});

/**
 * PUT /api/plans/:planId
 * Update a DCA plan
 */
router.put('/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    
    // Validate request body
    const { error, value } = updatePlanSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    // Check if plan exists
    const existingPlan = await database.getDcaPlan(planId);
    if (!existingPlan) {
      return res.status(404).json({
        error: 'Plan not found',
        message: `DCA plan with ID ${planId} not found`
      });
    }

    // Convert duration if it's provided as string
    const updateData = { ...value };
    if (updateData.duration && typeof updateData.duration === 'string') {
      updateData.duration = parseDurationToSeconds(updateData.duration);
    }

    // Update the plan
    const updatedPlan = await database.updateDcaPlan(planId, updateData);

    logger.info('✏️ DCA plan updated', {
      planId,
      updatedFields: Object.keys(updateData)
    });

    return res.json({
      success: true,
      data: {
        plan: updatedPlan
      }
    });

  } catch (error) {
    logger.error('❌ Failed to update DCA plan:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update DCA plan'
    });
  }
});

/**
 * DELETE /api/plans/:planId
 * Delete a DCA plan
 */
router.delete('/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    
    // Check if plan exists
    const existingPlan = await database.getDcaPlan(planId);
    if (!existingPlan) {
      return res.status(404).json({
        error: 'Plan not found',
        message: `DCA plan with ID ${planId} not found`
      });
    }

    // Delete the plan
    const deleted = await database.deleteDcaPlan(planId);

    if (deleted) {
      logger.info('🗑️ DCA plan deleted', { planId });

      return res.json({
        success: true,
        message: 'DCA plan deleted successfully'
      });
    } else {
      return res.status(500).json({
        error: 'Failed to delete plan',
        message: 'Plan deletion failed'
      });
    }

  } catch (error) {
    logger.error('❌ Failed to delete DCA plan:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete DCA plan'
    });
  }
});

/**
 * POST /api/plans/:planId/pause
 * Pause a DCA plan
 */
router.post('/:planId/pause', async (req, res) => {
  try {
    const { planId } = req.params;
    
    const updatedPlan = await database.updateDcaPlan(planId, { isActive: false });
    
    if (!updatedPlan) {
      return res.status(404).json({
        error: 'Plan not found',
        message: `DCA plan with ID ${planId} not found`
      });
    }

    logger.info('⏸️ DCA plan paused', { planId });

    return res.json({
      success: true,
      message: 'DCA plan paused successfully',
      data: {
        plan: updatedPlan
      }
    });

  } catch (error) {
    logger.error('❌ Failed to pause DCA plan:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to pause DCA plan'
    });
  }
});

/**
 * POST /api/plans/:planId/resume
 * Resume a paused DCA plan
 */
router.post('/:planId/resume', async (req, res) => {
  try {
    const { planId } = req.params;
    
    const updatedPlan = await database.updateDcaPlan(planId, { isActive: true });
    
    if (!updatedPlan) {
      return res.status(404).json({
        error: 'Plan not found',
        message: `DCA plan with ID ${planId} not found`
      });
    }

    logger.info('▶️ DCA plan resumed', { planId });

    return res.json({
      success: true,
      message: 'DCA plan resumed successfully',
      data: {
        plan: updatedPlan
      }
    });

  } catch (error) {
    logger.error('❌ Failed to resume DCA plan:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to resume DCA plan'
    });
  }
});

export default router;