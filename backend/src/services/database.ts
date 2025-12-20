import fs from 'fs/promises';
import path from 'path';
import { TimePeriod } from '../utils/time';
import { logger } from '../utils/logger';

/**
 * Data types for AutoBalancer backend storage
 */

/**
 * DCA Plan configuration
 */
export interface DcaPlan {
  id: string;
  userAddress: string;
  tokenFrom: string;
  tokenTo: string;
  amountPerPeriod: string; // In wei as string
  period: TimePeriod;
  duration: number; // Duration in seconds
  permissionId: string;
  startTime: number; // Unix timestamp
  lastExecutionTime: number; // Unix timestamp
  totalExecutions: number;
  totalAmountSpent: string; // In wei as string
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Asset weight configuration for portfolio rebalancing
 */
export interface AssetWeight {
  tokenAddress: string;
  targetWeight: number; // Percentage (0-100)
  currentWeight?: number; // Current percentage in portfolio
}

/**
 * Rebalancer configuration
 */
export interface RebalancerConfig {
  id: string;
  userAddress: string;
  assets: AssetWeight[];
  permissionId: string;
  rebalanceThreshold: number; // Percentage deviation that triggers rebalance
  lastRebalanceTime: number; // Unix timestamp
  totalRebalances: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Permission metadata for ERC-7715 compliance
 */
export interface PermissionMetadata {
  permissionId: string;
  userAddress: string;
  parentPermissionId?: string;
  allowance: string; // In wei as string
  spent: string; // In wei as string
  timeWindow: number; // In seconds
  resetTime: number; // Unix timestamp
  delegatee: string; // Agent contract address
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Execution log for tracking DCA and rebalance operations
 */
export interface ExecutionLog {
  id: string;
  type: 'dca' | 'rebalance';
  planId?: string; // For DCA executions
  configId?: string; // For rebalance executions
  userAddress: string;
  permissionId: string;
  txHash: string;
  gasUsed: string;
  inputAmount?: string; // For DCA
  outputAmount?: string; // For DCA
  inputAmounts?: string[]; // For rebalance
  outputAmounts?: string[]; // For rebalance
  tokenFrom?: string; // For DCA
  tokenTo?: string; // For DCA
  tokensFrom?: string[]; // For rebalance
  tokensTo?: string[]; // For rebalance
  executedAt: number; // Unix timestamp
  status: 'success' | 'failed';
  errorMessage?: string;
}

/**
 * In-memory database with JSON file persistence
 */
class JsonDatabase {
  private dataDir: string;
  private dcaPlans: Map<string, DcaPlan> = new Map();
  private rebalancerConfigs: Map<string, RebalancerConfig> = new Map();
  private permissions: Map<string, PermissionMetadata> = new Map();
  private executionLogs: Map<string, ExecutionLog> = new Map();

  constructor(dataDir = './data') {
    this.dataDir = dataDir;
    this.initialize();
  }

  /**
   * Initialize database and load existing data
   */
  private async initialize(): Promise<void> {
    try {
      // Create data directory if it doesn't exist
      await fs.mkdir(this.dataDir, { recursive: true });

      // Load existing data
      await this.loadData();
      
      logger.info('📁 JSON database initialized', { dataDir: this.dataDir });
    } catch (error) {
      logger.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Load data from JSON files
   */
  private async loadData(): Promise<void> {
    const files = [
      { name: 'dca-plans.json', map: this.dcaPlans },
      { name: 'rebalancer-configs.json', map: this.rebalancerConfigs },
      { name: 'permissions.json', map: this.permissions },
      { name: 'execution-logs.json', map: this.executionLogs }
    ];

    for (const file of files) {
      try {
        const filePath = path.join(this.dataDir, file.name);
        const data = await fs.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(data);
        
        Object.entries(parsed).forEach(([key, value]) => {
          file.map.set(key, value as any);
        });
        
        logger.debug(`Loaded ${file.map.size} records from ${file.name}`);
      } catch (error) {
        // File doesn't exist or is empty - that's okay
        logger.debug(`No existing data file: ${file.name}`);
      }
    }
  }

  /**
   * Save data to JSON files
   */
  private async saveData(): Promise<void> {
    const files = [
      { name: 'dca-plans.json', map: this.dcaPlans },
      { name: 'rebalancer-configs.json', map: this.rebalancerConfigs },
      { name: 'permissions.json', map: this.permissions },
      { name: 'execution-logs.json', map: this.executionLogs }
    ];

    for (const file of files) {
      try {
        const filePath = path.join(this.dataDir, file.name);
        const data = Object.fromEntries(file.map);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      } catch (error) {
        logger.error(`Failed to save ${file.name}:`, error);
      }
    }
  }

  // DCA Plans CRUD operations
  async createDcaPlan(plan: Omit<DcaPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<DcaPlan> {
    const id = `dca_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Math.floor(Date.now() / 1000);
    
    const newPlan: DcaPlan = {
      ...plan,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.dcaPlans.set(id, newPlan);
    await this.saveData();
    
    logger.info('Created DCA plan', { id, userAddress: plan.userAddress });
    return newPlan;
  }

  async getDcaPlans(userAddress?: string): Promise<DcaPlan[]> {
    const plans = Array.from(this.dcaPlans.values());
    return userAddress ? plans.filter(plan => plan.userAddress === userAddress) : plans;
  }

  async getDcaPlan(id: string): Promise<DcaPlan | null> {
    return this.dcaPlans.get(id) || null;
  }

  async updateDcaPlan(id: string, updates: Partial<DcaPlan>): Promise<DcaPlan | null> {
    const existing = this.dcaPlans.get(id);
    if (!existing) return null;

    const updated: DcaPlan = {
      ...existing,
      ...updates,
      updatedAt: Math.floor(Date.now() / 1000)
    };

    this.dcaPlans.set(id, updated);
    await this.saveData();
    
    return updated;
  }

  async deleteDcaPlan(id: string): Promise<boolean> {
    const deleted = this.dcaPlans.delete(id);
    if (deleted) {
      await this.saveData();
      logger.info('Deleted DCA plan', { id });
    }
    return deleted;
  }

  // Rebalancer Config CRUD operations
  async createRebalancerConfig(config: Omit<RebalancerConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<RebalancerConfig> {
    const id = `rebalancer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Math.floor(Date.now() / 1000);
    
    const newConfig: RebalancerConfig = {
      ...config,
      id,
      createdAt: now,
      updatedAt: now
    };

    this.rebalancerConfigs.set(id, newConfig);
    await this.saveData();
    
    logger.info('Created rebalancer config', { id, userAddress: config.userAddress });
    return newConfig;
  }

  async getRebalancerConfigs(userAddress?: string): Promise<RebalancerConfig[]> {
    const configs = Array.from(this.rebalancerConfigs.values());
    return userAddress ? configs.filter(config => config.userAddress === userAddress) : configs;
  }

  async getRebalancerConfig(id: string): Promise<RebalancerConfig | null> {
    return this.rebalancerConfigs.get(id) || null;
  }

  async updateRebalancerConfig(id: string, updates: Partial<RebalancerConfig>): Promise<RebalancerConfig | null> {
    const existing = this.rebalancerConfigs.get(id);
    if (!existing) return null;

    const updated: RebalancerConfig = {
      ...existing,
      ...updates,
      updatedAt: Math.floor(Date.now() / 1000)
    };

    this.rebalancerConfigs.set(id, updated);
    await this.saveData();
    
    return updated;
  }

  async deleteRebalancerConfig(id: string): Promise<boolean> {
    const deleted = this.rebalancerConfigs.delete(id);
    if (deleted) {
      await this.saveData();
      logger.info('Deleted rebalancer config', { id });
    }
    return deleted;
  }

  // Permission CRUD operations
  async createPermission(permission: Omit<PermissionMetadata, 'createdAt' | 'updatedAt'>): Promise<PermissionMetadata> {
    const now = Math.floor(Date.now() / 1000);
    
    const newPermission: PermissionMetadata = {
      ...permission,
      createdAt: now,
      updatedAt: now
    };

    this.permissions.set(permission.permissionId, newPermission);
    await this.saveData();
    
    logger.info('Created permission metadata', { permissionId: permission.permissionId });
    return newPermission;
  }

  async getPermissions(userAddress?: string): Promise<PermissionMetadata[]> {
    const permissions = Array.from(this.permissions.values());
    return userAddress ? permissions.filter(permission => permission.userAddress === userAddress) : permissions;
  }

  async getPermission(permissionId: string): Promise<PermissionMetadata | null> {
    return this.permissions.get(permissionId) || null;
  }

  async updatePermission(permissionId: string, updates: Partial<PermissionMetadata>): Promise<PermissionMetadata | null> {
    const existing = this.permissions.get(permissionId);
    if (!existing) return null;

    const updated: PermissionMetadata = {
      ...existing,
      ...updates,
      updatedAt: Math.floor(Date.now() / 1000)
    };

    this.permissions.set(permissionId, updated);
    await this.saveData();
    
    return updated;
  }

  // Execution Log operations
  async createExecutionLog(log: Omit<ExecutionLog, 'id'>): Promise<ExecutionLog> {
    const id = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newLog: ExecutionLog = {
      ...log,
      id
    };

    this.executionLogs.set(id, newLog);
    await this.saveData();
    
    return newLog;
  }

  async getExecutionLogs(userAddress?: string, limit = 100): Promise<ExecutionLog[]> {
    const logs = Array.from(this.executionLogs.values())
      .sort((a, b) => b.executedAt - a.executedAt); // Sort by newest first
    
    const filtered = userAddress ? logs.filter(log => log.userAddress === userAddress) : logs;
    return filtered.slice(0, limit);
  }

  async getExecutionLog(id: string): Promise<ExecutionLog | null> {
    return this.executionLogs.get(id) || null;
  }

  // Utility methods
  async getActiveItems(): Promise<{ dcaPlans: DcaPlan[], rebalancerConfigs: RebalancerConfig[] }> {
    const dcaPlans = Array.from(this.dcaPlans.values()).filter(plan => plan.isActive);
    const rebalancerConfigs = Array.from(this.rebalancerConfigs.values()).filter(config => config.isActive);
    
    return { dcaPlans, rebalancerConfigs };
  }

  async cleanup(): Promise<void> {
    await this.saveData();
    logger.info('Database cleanup completed');
  }
}

// Export singleton instance
export const database = new JsonDatabase();