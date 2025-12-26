// Generated types for AutoBalancer Agent contract
export interface AutoBalancerAgentContract {
  address: string;
  network: string;
}

// Entity types from schema
export interface AssetRebalanced {
  id: string;
  user: string;
  token: string;
  fromAmount: bigint;
  toAmount: bigint;
  action: string;
  executionId: string;
  db_write_timestamp?: number;
  chain_id: number;
  block_number: bigint;
  block_timestamp: bigint;
  transaction_hash: string;
  log_index: number;
}

export interface DCAExecuted {
  id: string;
  user: string;
  tokenFrom: string;
  tokenTo: string;
  amount: bigint;
  executedAt: bigint;
  executionId: string;
  db_write_timestamp?: number;
  chain_id: number;
  block_number: bigint;
  block_timestamp: bigint;
  transaction_hash: string;
  log_index: number;
}

export interface DelegationUsed {
  id: string;
  delegationId: string;
  delegatee: string;
  amount: bigint;
  remainingAllowance: bigint;
  db_write_timestamp?: number;
  chain_id: number;
  block_number: bigint;
  block_timestamp: bigint;
  transaction_hash: string;
  log_index: number;
}

export interface PermissionDelegated {
  id: string;
  parentPermissionId: string;
  delegator: string;
  delegatee: string;
  allowance: bigint;
  delegationId: string;
  createdAt: bigint;
  db_write_timestamp?: number;
  chain_id: number;
  block_number: bigint;
  block_timestamp: bigint;
  transaction_hash: string;
  log_index: number;
}

export interface RebalanceExecuted {
  id: string;
  user: string;
  totalAssets: bigint;
  totalValue: bigint;
  executedAt: bigint;
  executionId: string;
  db_write_timestamp?: number;
  chain_id: number;
  block_number: bigint;
  block_timestamp: bigint;
  transaction_hash: string;
  log_index: number;
}

// Event parameter types
export interface AssetRebalancedEvent {
  chainId: number;
  block: {
    number: number;
    timestamp: number;
  };
  transaction: {
    hash: string;
  };
  logIndex: number;
  params: {
    user: string;
    token: string;
    fromAmount: bigint;
    toAmount: bigint;
    action: string;
    executionId: string;
  };
}

export interface DCAExecutedEvent {
  chainId: number;
  block: {
    number: number;
    timestamp: number;
  };
  transaction: {
    hash: string;
  };
  logIndex: number;
  params: {
    user: string;
    tokenFrom: string;
    tokenTo: string;
    amount: bigint;
    executedAt: bigint;
    executionId: string;
  };
}

export interface DelegationUsedEvent {
  chainId: number;
  block: {
    number: number;
    timestamp: number;
  };
  transaction: {
    hash: string;
  };
  logIndex: number;
  params: {
    delegationId: string;
    delegatee: string;
    amount: bigint;
    remainingAllowance: bigint;
  };
}

export interface PermissionDelegatedEvent {
  chainId: number;
  block: {
    number: number;
    timestamp: number;
  };
  transaction: {
    hash: string;
  };
  logIndex: number;
  params: {
    parentPermissionId: string;
    delegator: string;
    delegatee: string;
    allowance: bigint;
    delegationId: string;
    createdAt: bigint;
  };
}

export interface RebalanceExecutedEvent {
  chainId: number;
  block: {
    number: number;
    timestamp: number;
  };
  transaction: {
    hash: string;
  };
  logIndex: number;
  params: {
    user: string;
    totalAssets: bigint;
    totalValue: bigint;
    executedAt: bigint;
    executionId: string;
  };
}

// Context types
export interface EntityContext {
  AssetRebalanced: {
    load: (id: string, entity: Partial<AssetRebalanced>) => void;
    set: (entity: AssetRebalanced) => void;
    get: (id: string) => AssetRebalanced | undefined;
  };
  DCAExecuted: {
    load: (id: string, entity: Partial<DCAExecuted>) => void;
    set: (entity: DCAExecuted) => void;
    get: (id: string) => DCAExecuted | undefined;
  };
  DelegationUsed: {
    load: (id: string, entity: Partial<DelegationUsed>) => void;
    set: (entity: DelegationUsed) => void;
    get: (id: string) => DelegationUsed | undefined;
  };
  PermissionDelegated: {
    load: (id: string, entity: Partial<PermissionDelegated>) => void;
    set: (entity: PermissionDelegated) => void;
    get: (id: string) => PermissionDelegated | undefined;
  };
  RebalanceExecuted: {
    load: (id: string, entity: Partial<RebalanceExecuted>) => void;
    set: (entity: RebalanceExecuted) => void;
    get: (id: string) => RebalanceExecuted | undefined;
  };
}