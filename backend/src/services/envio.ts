import { config } from '../config';
import { logger } from '../utils/logger';
import { ExecutionLog } from '../services/database';

/**
 * Envio integration for logging and querying execution data
 * 
 * Envio is a blockchain indexing and data pipeline service that helps track
 * and analyze on-chain activities. These functions provide integration points
 * for logging AutoBalancer executions and retrieving historical data.
 */

/**
 * Execution data structure for Envio logging
 */
export interface EnvioExecutionData {
  transactionHash: string;
  blockNumber?: number;
  blockTimestamp: number;
  userAddress: string;
  agentAddress: string;
  permissionId: string;
  executionType: 'dca' | 'rebalance';
  
  // DCA specific fields
  dcaData?: {
    tokenFrom: string;
    tokenTo: string;
    amountIn: string;
    amountOut: string;
    planId: string;
  };
  
  // Rebalance specific fields
  rebalanceData?: {
    tokensFrom: string[];
    tokensTo: string[];
    amountsIn: string[];
    amountsOut: string[];
    configId: string;
  };
  
  gasUsed: string;
  gasPrice?: string;
  executionCost?: string;
  status: 'success' | 'failed';
  errorMessage?: string;
}

/**
 * Historical execution query parameters
 */
export interface HistoricalQueryParams {
  userAddress?: string;
  executionType?: 'dca' | 'rebalance';
  startTime?: number; // Unix timestamp
  endTime?: number; // Unix timestamp
  limit?: number;
  offset?: number;
}

/**
 * Historical execution response
 */
export interface HistoricalExecutionsResponse {
  executions: EnvioExecutionData[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Envio API client for AutoBalancer integration
 */
class EnvioClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = config.envioApiUrl;
    this.apiKey = config.envioApiKey;
  }

  /**
   * Log execution data to Envio for indexing and analytics
   * 
   * @param executionData - Execution data to log
   * @returns Success status
   */
  async logExecution(executionData: EnvioExecutionData): Promise<boolean> {
    try {
      if (!this.apiKey) {
        logger.warn('Envio API key not configured, skipping log submission');
        return false;
      }

      logger.info('📊 Logging execution to Envio', {
        txHash: executionData.transactionHash,
        type: executionData.executionType,
        user: executionData.userAddress
      });

      // In a real implementation, this would make an HTTP request to Envio's API
      // For now, we'll simulate the API call and log locally
      const payload = {
        timestamp: new Date().toISOString(),
        data: executionData,
        source: 'autobalancer-backend'
      };

      // Simulated API call - replace with actual HTTP request
      const response = await this.mockApiCall('/executions', 'POST', payload);
      
      if (response.success) {
        logger.info('✅ Execution logged to Envio successfully', {
          txHash: executionData.transactionHash,
          envioId: response.data?.id
        });
        return true;
      } else {
        logger.error('❌ Failed to log execution to Envio', {
          error: response.error,
          txHash: executionData.transactionHash
        });
        return false;
      }
    } catch (error) {
      logger.error('❌ Error logging execution to Envio:', {
        error,
        txHash: executionData.transactionHash
      });
      return false;
    }
  }

  /**
   * Fetch historical executions from Envio
   * 
   * @param params - Query parameters
   * @returns Historical executions data
   */
  async fetchHistoricalExecutions(params: HistoricalQueryParams): Promise<HistoricalExecutionsResponse> {
    try {
      if (!this.apiKey) {
        logger.warn('Envio API key not configured, returning empty results');
        return {
          executions: [],
          totalCount: 0,
          hasMore: false
        };
      }

      logger.info('📈 Fetching historical executions from Envio', params);

      // In a real implementation, this would make an HTTP request to Envio's query API
      // For now, we'll simulate the API call
      const queryParams = new URLSearchParams();
      
      if (params.userAddress) queryParams.append('user', params.userAddress);
      if (params.executionType) queryParams.append('type', params.executionType);
      if (params.startTime) queryParams.append('start', params.startTime.toString());
      if (params.endTime) queryParams.append('end', params.endTime.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.offset) queryParams.append('offset', params.offset.toString());

      const response = await this.mockApiCall(`/executions?${queryParams.toString()}`, 'GET');

      if (response.success) {
        logger.info('✅ Historical executions fetched successfully', {
          count: response.data?.executions?.length || 0,
          totalCount: response.data?.totalCount || 0
        });

        return {
          executions: response.data?.executions || [],
          totalCount: response.data?.totalCount || 0,
          hasMore: response.data?.hasMore || false
        };
      } else {
        logger.error('❌ Failed to fetch historical executions from Envio', response.error);
        return {
          executions: [],
          totalCount: 0,
          hasMore: false
        };
      }
    } catch (error) {
      logger.error('❌ Error fetching historical executions from Envio:', error);
      return {
        executions: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }

  /**
   * Get aggregated analytics from Envio
   * 
   * @param userAddress - User address for analytics
   * @param timeRange - Time range in days (default: 30)
   * @returns Analytics data
   */
  async getAnalytics(userAddress: string, timeRange = 30): Promise<any> {
    try {
      if (!this.apiKey) {
        logger.warn('Envio API key not configured, returning empty analytics');
        return {};
      }

      logger.info('📊 Fetching analytics from Envio', { userAddress, timeRange });

      const response = await this.mockApiCall(`/analytics/${userAddress}?range=${timeRange}`, 'GET');

      if (response.success) {
        logger.info('✅ Analytics fetched successfully');
        return response.data || {};
      } else {
        logger.error('❌ Failed to fetch analytics from Envio', response.error);
        return {};
      }
    } catch (error) {
      logger.error('❌ Error fetching analytics from Envio:', error);
      return {};
    }
  }

  /**
   * Mock API call for development/testing
   * In production, replace with actual HTTP requests to Envio API
   */
  private async mockApiCall(endpoint: string, method: string, payload?: any): Promise<any> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    // Mock successful responses based on endpoint
    if (endpoint === '/executions' && method === 'POST') {
      return {
        success: true,
        data: {
          id: `envio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          indexed: true
        }
      };
    }

    if (endpoint.startsWith('/executions') && method === 'GET') {
      return {
        success: true,
        data: {
          executions: [], // Would return actual execution data
          totalCount: 0,
          hasMore: false
        }
      };
    }

    if (endpoint.startsWith('/analytics/')) {
      return {
        success: true,
        data: {
          totalExecutions: 0,
          totalVolume: '0',
          averageGasUsed: '0',
          successRate: 0
        }
      };
    }

    return {
      success: false,
      error: 'Endpoint not found'
    };
  }
}

// Create singleton instance
const envioClient = new EnvioClient();

/**
 * Log execution data to Envio for indexing
 * 
 * @param executionLog - Execution log from database
 * @returns Success status
 */
export async function logExecutionToEnvio(executionLog: ExecutionLog): Promise<boolean> {
  try {
    const envioData: EnvioExecutionData = {
      transactionHash: executionLog.txHash,
      blockTimestamp: executionLog.executedAt,
      userAddress: executionLog.userAddress,
      agentAddress: config.agentContractAddress,
      permissionId: executionLog.permissionId,
      executionType: executionLog.type,
      gasUsed: executionLog.gasUsed,
      status: executionLog.status,
      ...(executionLog.errorMessage && { errorMessage: executionLog.errorMessage })
    };

    // Add type-specific data
    if (executionLog.type === 'dca' && executionLog.planId) {
      envioData.dcaData = {
        tokenFrom: executionLog.tokenFrom!,
        tokenTo: executionLog.tokenTo!,
        amountIn: executionLog.inputAmount!,
        amountOut: executionLog.outputAmount!,
        planId: executionLog.planId
      };
    } else if (executionLog.type === 'rebalance' && executionLog.configId) {
      envioData.rebalanceData = {
        tokensFrom: executionLog.tokensFrom!,
        tokensTo: executionLog.tokensTo!,
        amountsIn: executionLog.inputAmounts!,
        amountsOut: executionLog.outputAmounts!,
        configId: executionLog.configId
      };
    }

    return await envioClient.logExecution(envioData);
  } catch (error) {
    logger.error('❌ Failed to prepare execution data for Envio:', error);
    return false;
  }
}

/**
 * Fetch historical executions for a user
 * 
 * @param userAddress - User address
 * @param params - Additional query parameters
 * @returns Historical executions
 */
export async function fetchHistoricalExecutions(
  userAddress: string,
  params: Omit<HistoricalQueryParams, 'userAddress'> = {}
): Promise<HistoricalExecutionsResponse> {
  return await envioClient.fetchHistoricalExecutions({
    ...params,
    userAddress
  });
}

/**
 * Get user analytics from Envio
 * 
 * @param userAddress - User address
 * @param timeRange - Time range in days
 * @returns Analytics data
 */
export async function getUserAnalytics(userAddress: string, timeRange = 30): Promise<any> {
  return await envioClient.getAnalytics(userAddress, timeRange);
}

/**
 * Bulk log multiple executions to Envio
 * 
 * @param executionLogs - Array of execution logs
 * @returns Array of success statuses
 */
export async function bulkLogExecutionsToEnvio(executionLogs: ExecutionLog[]): Promise<boolean[]> {
  const promises = executionLogs.map(log => logExecutionToEnvio(log));
  return await Promise.all(promises);
}

// Export the client for advanced usage
export { EnvioClient, envioClient };