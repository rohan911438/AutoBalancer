import * as cron from 'node-cron';
import { dcaEngine } from './dcaEngine';
import { rebalanceEngine } from './rebalanceEngine';
import { database } from './database';
import { logger } from '../utils/logger';
import { config } from '../config';

/**
 * Scheduler Statistics
 */
interface SchedulerStats {
  isRunning: boolean;
  lastRunTime: number;
  totalRuns: number;
  totalDCAExecutions: number;
  totalRebalanceExecutions: number;
  totalErrors: number;
  averageRunDuration: number;
  uptime: number;
}

/**
 * Scheduler Service
 * 
 * Manages automated execution of DCA plans and portfolio rebalancing.
 * Runs periodically based on configured interval and handles error recovery.
 */
export class SchedulerService {
  private cronJob: cron.ScheduledTask | null = null;
  private isRunning = false;
  private startTime: number;
  private stats: SchedulerStats;

  constructor() {
    this.startTime = Date.now();
    this.stats = {
      isRunning: false,
      lastRunTime: 0,
      totalRuns: 0,
      totalDCAExecutions: 0,
      totalRebalanceExecutions: 0,
      totalErrors: 0,
      averageRunDuration: 0,
      uptime: 0
    };

    logger.info('⏰ Scheduler Service initialized', {
      intervalMinutes: config.schedulerIntervalMinutes
    });
  }

  /**
   * Start the automated scheduler
   */
  async start(): Promise<void> {
    try {
      if (this.isRunning) {
        logger.warn('⚠️ Scheduler is already running');
        return;
      }

      // Create cron expression for the configured interval
      const cronExpression = this.createCronExpression(config.schedulerIntervalMinutes);
      
      logger.info(`🚀 Starting scheduler with expression: ${cronExpression}`);

      // Create and start the cron job
      this.cronJob = cron.schedule(cronExpression, async () => {
        await this.executeScheduledTasks();
      }, {
        scheduled: true,
        timezone: 'UTC'
      });

      this.isRunning = true;
      this.stats.isRunning = true;

      // Run initial execution after a short delay
      setTimeout(async () => {
        logger.info('🎯 Running initial scheduled execution...');
        await this.executeScheduledTasks();
      }, 5000);

      logger.info('✅ Scheduler started successfully');

    } catch (error) {
      logger.error('❌ Failed to start scheduler:', error);
      throw error;
    }
  }

  /**
   * Stop the automated scheduler
   */
  async stop(): Promise<void> {
    try {
      if (!this.isRunning) {
        logger.warn('⚠️ Scheduler is not running');
        return;
      }

      if (this.cronJob) {
        this.cronJob.destroy();
        this.cronJob = null;
      }

      this.isRunning = false;
      this.stats.isRunning = false;

      // Cleanup database connections
      await database.cleanup();

      logger.info('🛑 Scheduler stopped successfully');

    } catch (error) {
      logger.error('❌ Failed to stop scheduler:', error);
      throw error;
    }
  }

  /**
   * Execute scheduled tasks (DCA and rebalancing)
   */
  private async executeScheduledTasks(): Promise<void> {
    const startTime = Date.now();
    let dcaResults = [];
    let rebalanceResults = [];
    let hasErrors = false;

    try {
      logger.info('🔄 Starting scheduled execution cycle...');

      // Execute DCA plans
      try {
        logger.info('💰 Processing DCA plans...');
        dcaResults = await dcaEngine.processAllPlans();
        
        const successfulDCA = dcaResults.filter(r => r.success).length;
        const skippedDCA = dcaResults.filter(r => r.skipReason).length;
        const failedDCA = dcaResults.filter(r => !r.success && !r.skipReason).length;

        logger.info(`💰 DCA processing completed: ${successfulDCA} executed, ${skippedDCA} skipped, ${failedDCA} failed`);

        this.stats.totalDCAExecutions += successfulDCA;

      } catch (error) {
        logger.error('❌ Error during DCA processing:', error);
        hasErrors = true;
      }

      // Execute rebalancing
      try {
        logger.info('⚖️ Processing rebalancer configurations...');
        rebalanceResults = await rebalanceEngine.processAllConfigurations();

        const successfulRebalance = rebalanceResults.filter(r => r.success).length;
        const skippedRebalance = rebalanceResults.filter(r => r.skipReason).length;
        const failedRebalance = rebalanceResults.filter(r => !r.success && !r.skipReason).length;

        logger.info(`⚖️ Rebalancing completed: ${successfulRebalance} executed, ${skippedRebalance} skipped, ${failedRebalance} failed`);

        this.stats.totalRebalanceExecutions += successfulRebalance;

      } catch (error) {
        logger.error('❌ Error during rebalancing:', error);
        hasErrors = true;
      }

      // Update statistics
      const duration = Date.now() - startTime;
      this.stats.lastRunTime = Math.floor(Date.now() / 1000);
      this.stats.totalRuns++;
      
      if (hasErrors) {
        this.stats.totalErrors++;
      }

      // Update average run duration
      this.stats.averageRunDuration = 
        (this.stats.averageRunDuration * (this.stats.totalRuns - 1) + duration) / this.stats.totalRuns;

      const totalExecutions = dcaResults.length + rebalanceResults.length;
      const successfulExecutions = dcaResults.filter(r => r.success).length + 
                                  rebalanceResults.filter(r => r.success).length;

      logger.info(`✅ Scheduled execution completed in ${duration}ms`, {
        totalProcessed: totalExecutions,
        successful: successfulExecutions,
        duration: `${duration}ms`,
        hasErrors
      });

      // Emit execution event for monitoring
      this.emitExecutionEvent({
        timestamp: this.stats.lastRunTime,
        duration,
        dcaResults,
        rebalanceResults,
        hasErrors
      });

    } catch (error) {
      logger.error('❌ Critical error during scheduled execution:', error);
      this.stats.totalErrors++;
      
      // Implement exponential backoff for critical errors
      await this.handleCriticalError(error);
    }
  }

  /**
   * Handle critical errors with retry logic
   */
  private async handleCriticalError(error: any): Promise<void> {
    logger.error('🚨 Critical scheduler error, implementing recovery strategy:', error);

    // Stop scheduler temporarily
    if (this.cronJob) {
      this.cronJob.destroy();
      this.cronJob = null;
    }

    // Wait before restarting (exponential backoff)
    const backoffTime = Math.min(1000 * Math.pow(2, Math.min(this.stats.totalErrors, 6)), 60000);
    logger.warn(`⏸️ Scheduler paused for ${backoffTime}ms due to critical error`);

    await new Promise(resolve => setTimeout(resolve, backoffTime));

    // Restart scheduler
    try {
      const cronExpression = this.createCronExpression(config.schedulerIntervalMinutes);
      this.cronJob = cron.schedule(cronExpression, async () => {
        await this.executeScheduledTasks();
      }, {
        scheduled: true,
        timezone: 'UTC'
      });

      logger.info('🔄 Scheduler restarted after critical error recovery');
    } catch (restartError) {
      logger.error('❌ Failed to restart scheduler after critical error:', restartError);
      throw restartError;
    }
  }

  /**
   * Create cron expression based on interval in minutes
   */
  private createCronExpression(intervalMinutes: number): string {
    if (intervalMinutes >= 60 && intervalMinutes % 60 === 0) {
      // Hourly intervals
      const hours = intervalMinutes / 60;
      return `0 */${hours} * * *`;
    } else if (intervalMinutes >= 1440 && intervalMinutes % 1440 === 0) {
      // Daily intervals
      const days = intervalMinutes / 1440;
      return `0 0 */${days} * *`;
    } else {
      // Minute intervals (most common for DCA)
      return `*/${intervalMinutes} * * * *`;
    }
  }

  /**
   * Get scheduler statistics
   */
  getStats(): SchedulerStats {
    this.stats.uptime = Date.now() - this.startTime;
    return { ...this.stats };
  }

  /**
   * Force execute scheduled tasks (manual trigger)
   */
  async forceExecution(): Promise<void> {
    if (!this.isRunning) {
      logger.warn('⚠️ Scheduler is not running, cannot force execution');
      return;
    }

    logger.info('🎯 Manually triggered scheduled execution...');
    await this.executeScheduledTasks();
  }

  /**
   * Update scheduler interval (requires restart)
   */
  async updateInterval(newIntervalMinutes: number): Promise<void> {
    logger.info(`🔧 Updating scheduler interval from ${config.schedulerIntervalMinutes} to ${newIntervalMinutes} minutes`);

    const wasRunning = this.isRunning;
    
    if (wasRunning) {
      await this.stop();
    }

    // Update configuration (in production, this would update the config file)
    (config as any).schedulerIntervalMinutes = newIntervalMinutes;

    if (wasRunning) {
      await this.start();
    }

    logger.info('✅ Scheduler interval updated successfully');
  }

  /**
   * Emergency stop all automated trading
   */
  async emergencyStop(reason?: string): Promise<void> {
    logger.error(`🚨 EMERGENCY STOP triggered${reason ? ': ' + reason : ''}`);

    // Stop scheduler
    await this.stop();

    // Get all active items and pause them
    try {
      const { dcaPlans, rebalancerConfigs } = await database.getActiveItems();

      // Pause all DCA plans
      for (const plan of dcaPlans) {
        await database.updateDcaPlan(plan.id, { isActive: false });
      }

      // Pause all rebalancer configs
      for (const config of rebalancerConfigs) {
        await database.updateRebalancerConfig(config.id, { isActive: false });
      }

      logger.error(`🚨 Emergency stop completed: ${dcaPlans.length} DCA plans and ${rebalancerConfigs.length} rebalancer configs paused`);

    } catch (error) {
      logger.error('❌ Error during emergency stop:', error);
      throw error;
    }
  }

  /**
   * Emit execution event for external monitoring
   */
  private emitExecutionEvent(eventData: any): void {
    // In production, this could emit to:
    // - WebSocket connections for real-time updates
    // - Event bus for microservices
    // - Monitoring services like DataDog, New Relic
    // - Webhook endpoints for notifications
    
    logger.debug('📡 Execution event emitted', {
      timestamp: eventData.timestamp,
      duration: eventData.duration,
      dcaCount: eventData.dcaResults.length,
      rebalanceCount: eventData.rebalanceResults.length,
      hasErrors: eventData.hasErrors
    });
  }

  /**
   * Health check for scheduler service
   */
  healthCheck(): {
    status: 'healthy' | 'unhealthy' | 'degraded';
    details: any;
  } {
    const now = Date.now();
    const lastRunAge = this.stats.lastRunTime > 0 ? 
      now - (this.stats.lastRunTime * 1000) : 0;

    const maxAllowedAge = (config.schedulerIntervalMinutes * 60 * 1000) * 2; // 2x interval

    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

    if (!this.isRunning) {
      status = 'unhealthy';
    } else if (this.stats.totalErrors > 10 || lastRunAge > maxAllowedAge) {
      status = 'degraded';
    }

    return {
      status,
      details: {
        isRunning: this.isRunning,
        lastRunAge: `${Math.floor(lastRunAge / 1000)}s ago`,
        totalRuns: this.stats.totalRuns,
        totalErrors: this.stats.totalErrors,
        errorRate: this.stats.totalRuns > 0 ? 
          ((this.stats.totalErrors / this.stats.totalRuns) * 100).toFixed(2) + '%' : '0%',
        uptime: `${Math.floor(this.stats.uptime / 1000)}s`
      }
    };
  }
}

// Export singleton instance
export const schedulerService = new SchedulerService();