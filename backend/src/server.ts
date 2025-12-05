import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config, isDevelopment } from './config';
import { logger } from './utils/logger';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: isDevelopment ? 'http://localhost:5173' : process.env['ALLOWED_ORIGINS']?.split(','),
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.nodeEnv
  });
});

// Basic API routes
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'AutoBalancer backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Wallet connection test endpoint
app.post('/api/wallet/connect', (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    // Simple validation
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format'
      });
    }

    logger.info(`Wallet connected: ${address}`);
    
    return res.json({
      success: true,
      message: 'Wallet connected successfully',
      address,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Plans endpoint (basic)
app.get('/api/plans', (req, res) => {
  const { userAddress } = req.query;
  
  res.json({
    success: true,
    data: {
      plans: [],
      userAddress,
      message: 'No DCA plans found. Feature coming soon!'
    }
  });
});

// Rebalancer endpoint (basic)
app.get('/api/rebalancer', (req, res) => {
  const { userAddress } = req.query;
  
  res.json({
    success: true,
    data: {
      configs: [],
      userAddress,
      message: 'No rebalancer configs found. Feature coming soon!'
    }
  });
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    error: isDevelopment ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`🚀 AutoBalancer Backend started on port ${PORT}`);
  logger.info(`🌍 Environment: ${config.nodeEnv}`);
  logger.info(`📱 CORS enabled for: ${config.corsOrigins.join(', ')}`);
  logger.info('✅ Server is ready to receive requests');
});

export default app;