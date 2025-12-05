import dotenv from 'dotenv';
import { ethers } from 'ethers';

// Load environment variables
dotenv.config();

/**
 * Application configuration interface
 */
interface AppConfig {
  // Server configuration
  port: number;
  nodeEnv: string;
  corsOrigins: string[];
  
  // Ethereum configuration
  rpcUrl: string;
  privateKey: string;
  agentContractAddress: string;
  
  // Scheduler configuration
  schedulerIntervalMinutes: number;
  rebalanceThresholdPercent: number;
  
  // Logging configuration
  logLevel: string;
  
  // Envio configuration
  envioApiUrl: string;
  envioApiKey: string;
}

/**
 * Validates required environment variables
 */
function validateEnv(): void {
  const required = [
    'ETHEREUM_RPC_URL',
    'PRIVATE_KEY', 
    'AGENT_CONTRACT_ADDRESS'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate Ethereum address format
  if (!ethers.isAddress(process.env['AGENT_CONTRACT_ADDRESS']!)) {
    throw new Error('Invalid AGENT_CONTRACT_ADDRESS format');
  }
  
  // Validate private key format
  try {
    new ethers.Wallet(process.env['PRIVATE_KEY']!);
  } catch (error) {
    throw new Error('Invalid PRIVATE_KEY format');
  }
}

// Validate environment on module load
validateEnv();

/**
 * Application configuration object
 */
export const config: AppConfig = {
  // Server configuration
  port: parseInt(process.env['PORT'] || '3001', 10),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  corsOrigins: (process.env['ALLOWED_ORIGINS'] || 'http://localhost:5173').split(','),
  
  // Ethereum configuration
  rpcUrl: process.env['ETHEREUM_RPC_URL']!,
  privateKey: process.env['PRIVATE_KEY']!,
  agentContractAddress: process.env['AGENT_CONTRACT_ADDRESS']!,
  
  // Scheduler configuration
  schedulerIntervalMinutes: parseInt(process.env['SCHEDULER_INTERVAL_MINUTES'] || '1', 10),
  rebalanceThresholdPercent: parseInt(process.env['REBALANCE_THRESHOLD_PERCENT'] || '5', 10),
  
  // Logging configuration
  logLevel: process.env['LOG_LEVEL'] || 'info',
  
  // Envio configuration
  envioApiUrl: process.env['ENVIO_API_URL'] || 'https://api.envio.dev',
  envioApiKey: process.env['ENVIO_API_KEY'] || '',
};

/**
 * Ethereum provider and signer setup
 */
export const provider = new ethers.JsonRpcProvider(config.rpcUrl);
export const signer = new ethers.Wallet(config.privateKey, provider);

/**
 * Check if running in development mode
 */
export const isDevelopment = config.nodeEnv === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = config.nodeEnv === 'production';