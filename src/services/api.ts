// API Configuration for AutoBalancer Frontend

// Safe environment configuration for Vite
const getApiUrl = () => {
  try {
    // Use import.meta.env for Vite compatibility
    const baseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3001';
    return `${baseUrl}/api`;
  } catch {
    return 'http://localhost:3001/api';
  }
};

const getBaseUrl = () => {
  try {
    return import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3001';
  } catch {
    return 'http://localhost:3001';
  }
};

const API_BASE_URL = getApiUrl();
const BASE_URL = getBaseUrl();

console.log('🔧 API Configuration:', { API_BASE_URL, BASE_URL });

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  // Health check (not under /api)
  HEALTH: '/health',
  
  // Test endpoint
  TEST: '/test',
  
  // Wallet endpoints
  WALLET_CONNECT: '/wallet/connect',
  
  // DCA Plans
  PLANS: '/plans',
  PLANS_BY_USER: (userAddress: string) => `/plans?userAddress=${userAddress}`,
  PLAN_BY_ID: (planId: string) => `/plans/plan/${planId}`,
  PLAN_PAUSE: (planId: string) => `/plans/${planId}/pause`,
  PLAN_RESUME: (planId: string) => `/plans/${planId}/resume`,
  
  // Rebalancer
  REBALANCER: '/rebalancer',
  REBALANCER_BY_USER: (userAddress: string) => `/rebalancer?userAddress=${userAddress}`,
  
  // Delegation
  DELEGATION_STATUS: (userAddress: string) => `/delegation/status/${userAddress}`,
  DELEGATION_CREATE: '/delegation/create',
  DELEGATION_REVOKE: '/delegation/revoke',
  DELEGATION_HISTORY: (userAddress: string) => `/delegation/history/${userAddress}`,
  
  // Permissions
  PERMISSIONS: (userAddress: string) => `/permissions/${userAddress}`,
  PERMISSIONS_VALIDATE: '/permissions/validate',
  PERMISSIONS_USAGE: '/permissions/usage',
  PERMISSIONS_REVOKE: '/permissions/revoke',
};

/**
 * HTTP Client for API calls
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
export const apiClient = new ApiClient();

/**
 * API service functions
 */
export const apiService = {
  // Health check
  async healthCheck() {
    // Health endpoint is at base URL, not API base URL
    const url = `${BASE_URL}${API_ENDPOINTS.HEALTH}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  },

  // Test backend connection
  async testConnection() {
    return apiClient.get(API_ENDPOINTS.TEST);
  },

  // Wallet connection
  async connectWallet(address: string) {
    return apiClient.post(API_ENDPOINTS.WALLET_CONNECT, { address });
  },

  // DCA Plans
  async getDCAPlans(userAddress: string) {
    return apiClient.get(API_ENDPOINTS.PLANS_BY_USER(userAddress));
  },

  async createDCAPlan(plan: any) {
    return apiClient.post(API_ENDPOINTS.PLANS, plan);
  },

  async updateDCAPlan(planId: string, updates: any) {
    return apiClient.put(`/plans/${planId}`, updates);
  },

  async deleteDCAPlan(planId: string) {
    return apiClient.delete(`/plans/${planId}`);
  },

  async pauseDCAPlan(planId: string) {
    return apiClient.post(API_ENDPOINTS.PLAN_PAUSE(planId));
  },

  async resumeDCAPlan(planId: string) {
    return apiClient.post(API_ENDPOINTS.PLAN_RESUME(planId));
  },

  // Rebalancer
  async getRebalancerConfigs(userAddress: string) {
    return apiClient.get(API_ENDPOINTS.REBALANCER_BY_USER(userAddress));
  },

  async createRebalancerConfig(config: any) {
    return apiClient.post(API_ENDPOINTS.REBALANCER, config);
  },

  async updateRebalancerConfig(configId: string, updates: any) {
    return apiClient.put(`/rebalancer/${configId}`, updates);
  },

  async deleteRebalancerConfig(configId: string) {
    return apiClient.delete(`/rebalancer/${configId}`);
  },

  // Delegation
  async getDelegationStatus(userAddress: string) {
    return apiClient.get(API_ENDPOINTS.DELEGATION_STATUS(userAddress));
  },

  async createDelegation(delegation: any) {
    return apiClient.post(API_ENDPOINTS.DELEGATION_CREATE, delegation);
  },

  async revokeDelegation(revocation: any) {
    return apiClient.post(API_ENDPOINTS.DELEGATION_REVOKE, revocation);
  },

  async getDelegationHistory(userAddress: string, limit = 20, offset = 0) {
    return apiClient.get(`${API_ENDPOINTS.DELEGATION_HISTORY(userAddress)}?limit=${limit}&offset=${offset}`);
  },

  // Permissions
  async getUserPermissions(userAddress: string) {
    return apiClient.get(API_ENDPOINTS.PERMISSIONS(userAddress));
  },

  async validatePermission(validation: any) {
    return apiClient.post(API_ENDPOINTS.PERMISSIONS_VALIDATE, validation);
  },

  async recordPermissionUsage(usage: any) {
    return apiClient.post(API_ENDPOINTS.PERMISSIONS_USAGE, usage);
  },

  async revokePermission(revocation: any) {
    return apiClient.post(API_ENDPOINTS.PERMISSIONS_REVOKE, revocation);
  },

  async getPermissionUsageHistory(userAddress: string, filters = {}) {
    const params = new URLSearchParams({
      ...filters,
      limit: '20',
      offset: '0'
    }).toString();
    
    return apiClient.get(`${API_ENDPOINTS.PERMISSIONS(userAddress)}/usage?${params}`);
  },
};

// Export types for TypeScript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface DcaPlan {
  id: string;
  userAddress: string;
  tokenIn: string;
  tokenOut: string;
  amountPerExecution: string;
  frequency: number;
  totalExecutions: number;
  executedCount: number;
  nextExecutionTime: number;
  minPrice?: string;
  maxPrice?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface RebalancerConfig {
  id: string;
  userAddress: string;
  name: string;
  targets: Array<{
    tokenAddress: string;
    percentage: number;
  }>;
  deviationThreshold: number;
  minExecutionAmount: string;
  lastExecutionTime: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Permission {
  tokenAddress: string;
  amount: string;
  expiry: number;
  usage?: {
    totalUsed: string;
    remainingAmount: string;
    usageCount: number;
    lastUsed: number | null;
  };
}

export interface DelegationStatus {
  isDelegated: boolean;
  delegatedAt: number;
  permissions: Permission[];
  lastUpdated: number;
}