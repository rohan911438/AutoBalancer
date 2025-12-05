import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, isDevelopment } from './config';
import { logger } from './utils/logger';
import { schedulerService } from './services/scheduler';

// Import API routes
import plansRouter from './api/plans';
import rebalancerRouter from './api/rebalancer';
import delegationRouter from './api/delegation';
import permissionsRouter from './api/permissions';

/**
 * AutoBalancer Backend Server
 * 
 * Main application entry point that sets up Express server with middleware,
 * API routes, and automated scheduler services for DCA and rebalancing.
 */
class AutoBalancerServer {
  private app: express.Application;
  private schedulerService: SchedulerService;

  constructor() {
    this.app = express();
    this.schedulerService = new SchedulerService();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Configure Express middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: config.corsOrigins,
      credentials: true
    }));
    
    // Request parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Logging middleware (only in development)
    if (isDevelopment) {
      this.app.use(morgan('dev'));
    }
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const healthData = schedulerService.healthCheck();
      res.json({
        status: healthData.status,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: config.nodeEnv,
        scheduler: healthData.details
      });
    });

    // Scheduler status endpoint
    this.app.get('/api/scheduler/status', (req, res) => {
      const stats = schedulerService.getStats();
      res.json({
        success: true,
        data: stats
      });
    });

    // Force scheduler execution endpoint (development only)
    if (isDevelopment) {
      this.app.post('/api/scheduler/execute', async (req, res) => {
        try {
          await schedulerService.forceExecution();
          res.json({
            success: true,
            message: 'Scheduler execution triggered manually'
          });
        } catch (error) {
          logger.error('Error in manual scheduler execution:', error);
          res.status(500).json({
            success: false,
            error: 'Failed to execute scheduler manually'
          });
        }
      });
    }

    // API routes
    this.app.use('/api/plans', plansRouter);
    this.app.use('/api/rebalancer', rebalancerRouter);
    this.app.use('/api/delegation', delegationRouter);
    this.app.use('/api/permissions', permissionsRouter);

    // 404 handler for unknown routes
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
      });
    });
  }

  /**
   * Setup global error handling middleware
   */
  private setupErrorHandling(): void {
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
      });

      // Don't expose internal errors in production
      const message = isDevelopment ? err.message : 'Internal server error';
      
      res.status(500).json({
        error: message,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Start the server and automated services
   */
  public async start(): Promise<void> {
    try {
      // Start the HTTP server
      this.app.listen(config.port, () => {
        logger.info(`🚀 AutoBalancer Backend started on port ${config.port}`);
        logger.info(`🌍 Environment: ${config.nodeEnv}`);
        logger.info(`📊 Scheduler interval: ${config.schedulerIntervalMinutes} minute(s)`);
      });

      // Start the automated scheduler
      await schedulerService.start();
      logger.info('⏰ Automated scheduler started');

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    logger.info('🛑 Shutting down AutoBalancer Backend...');
    
    try {
      await schedulerService.stop();
      logger.info('✅ Scheduler stopped');
      
      // Give time for pending requests to complete
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and start the server
const server = new AutoBalancerServer();

// Graceful shutdown handlers
process.on('SIGTERM', () => server.shutdown());
process.on('SIGINT', () => server.shutdown());

// Start the server
server.start().catch(error => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

export default server;