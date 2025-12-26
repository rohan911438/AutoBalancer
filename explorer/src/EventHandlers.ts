/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  AutoBalancerAgentContract,
  AssetRebalanced,
  DCAExecuted,
  DelegationUsed,
  PermissionDelegated,
  RebalanceExecuted,
} from "../generated";

import type {
  AssetRebalancedEvent,
  DCAExecutedEvent,
  DelegationUsedEvent,
  PermissionDelegatedEvent,
  RebalanceExecutedEvent,
  EntityContext,
} from "../generated";

import {
  AutoBalancerAgentContract_AssetRebalanced_loader,
  AutoBalancerAgentContract_AssetRebalanced_handler,
  AutoBalancerAgentContract_DCAExecuted_loader,
  AutoBalancerAgentContract_DCAExecuted_handler,
  AutoBalancerAgentContract_DelegationUsed_loader,
  AutoBalancerAgentContract_DelegationUsed_handler,
  AutoBalancerAgentContract_PermissionDelegated_loader,
  AutoBalancerAgentContract_PermissionDelegated_handler,
  AutoBalancerAgentContract_RebalanceExecuted_loader,
  AutoBalancerAgentContract_RebalanceExecuted_handler,
} from "../generated/handlers";

// Asset Rebalanced Event
AutoBalancerAgentContract_AssetRebalanced_loader(({ event, context }: {
  event: AssetRebalancedEvent;
  context: EntityContext;
}) => {
  context.AssetRebalanced.load(
    `${event.chainId}_${event.block.number}_${event.logIndex}`,
    {}
  );
});

AutoBalancerAgentContract_AssetRebalanced_handler(({ event, context }: {
  event: AssetRebalancedEvent;
  context: EntityContext;
}) => {
  const entity: AssetRebalanced = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    token: event.params.token,
    fromAmount: event.params.fromAmount,
    toAmount: event.params.toAmount,
    action: event.params.action,
    executionId: event.params.executionId,
    db_write_timestamp: undefined,
    chain_id: event.chainId,
    block_number: BigInt(event.block.number),
    block_timestamp: BigInt(event.block.timestamp),
    transaction_hash: event.transaction.hash,
    log_index: event.logIndex,
  };

  context.AssetRebalanced.set(entity);
});

// DCA Executed Event
AutoBalancerAgentContract_DCAExecuted_loader(({ event, context }: {
  event: DCAExecutedEvent;
  context: EntityContext;
}) => {
  context.DCAExecuted.load(
    `${event.chainId}_${event.block.number}_${event.logIndex}`,
    {}
  );
});

AutoBalancerAgentContract_DCAExecuted_handler(({ event, context }: {
  event: DCAExecutedEvent;
  context: EntityContext;
}) => {
  const entity: DCAExecuted = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    tokenFrom: event.params.tokenFrom,
    tokenTo: event.params.tokenTo,
    amount: event.params.amount,
    executedAt: event.params.executedAt,
    executionId: event.params.executionId,
    db_write_timestamp: undefined,
    chain_id: event.chainId,
    block_number: BigInt(event.block.number),
    block_timestamp: BigInt(event.block.timestamp),
    transaction_hash: event.transaction.hash,
    log_index: event.logIndex,
  };

  context.DCAExecuted.set(entity);
});

// Delegation Used Event
AutoBalancerAgentContract_DelegationUsed_loader(({ event, context }: {
  event: DelegationUsedEvent;
  context: EntityContext;
}) => {
  context.DelegationUsed.load(
    `${event.chainId}_${event.block.number}_${event.logIndex}`,
    {}
  );
});

AutoBalancerAgentContract_DelegationUsed_handler(({ event, context }: {
  event: DelegationUsedEvent;
  context: EntityContext;
}) => {
  const entity: DelegationUsed = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    delegationId: event.params.delegationId,
    delegatee: event.params.delegatee,
    amount: event.params.amount,
    remainingAllowance: event.params.remainingAllowance,
    db_write_timestamp: undefined,
    chain_id: event.chainId,
    block_number: BigInt(event.block.number),
    block_timestamp: BigInt(event.block.timestamp),
    transaction_hash: event.transaction.hash,
    log_index: event.logIndex,
  };

  context.DelegationUsed.set(entity);
});

// Permission Delegated Event
AutoBalancerAgentContract_PermissionDelegated_loader(({ event, context }: {
  event: PermissionDelegatedEvent;
  context: EntityContext;
}) => {
  context.PermissionDelegated.load(
    `${event.chainId}_${event.block.number}_${event.logIndex}`,
    {}
  );
});

AutoBalancerAgentContract_PermissionDelegated_handler(({ event, context }: {
  event: PermissionDelegatedEvent;
  context: EntityContext;
}) => {
  const entity: PermissionDelegated = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    parentPermissionId: event.params.parentPermissionId,
    delegator: event.params.delegator,
    delegatee: event.params.delegatee,
    allowance: event.params.allowance,
    delegationId: event.params.delegationId,
    createdAt: event.params.createdAt,
    db_write_timestamp: undefined,
    chain_id: event.chainId,
    block_number: BigInt(event.block.number),
    block_timestamp: BigInt(event.block.timestamp),
    transaction_hash: event.transaction.hash,
    log_index: event.logIndex,
  };

  context.PermissionDelegated.set(entity);
});

// Rebalance Executed Event
AutoBalancerAgentContract_RebalanceExecuted_loader(({ event, context }: {
  event: RebalanceExecutedEvent;
  context: EntityContext;
}) => {
  context.RebalanceExecuted.load(
    `${event.chainId}_${event.block.number}_${event.logIndex}`,
    {}
  );
});

AutoBalancerAgentContract_RebalanceExecuted_handler(({ event, context }: {
  event: RebalanceExecutedEvent;
  context: EntityContext;
}) => {
  const entity: RebalanceExecuted = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    user: event.params.user,
    totalAssets: event.params.totalAssets,
    totalValue: event.params.totalValue,
    executedAt: event.params.executedAt,
    executionId: event.params.executionId,
    db_write_timestamp: undefined,
    chain_id: event.chainId,
    block_number: BigInt(event.block.number),
    block_timestamp: BigInt(event.block.timestamp),
    transaction_hash: event.transaction.hash,
    log_index: event.logIndex,
  };

  context.RebalanceExecuted.set(entity);
});