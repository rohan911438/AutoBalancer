// Generated handler and loader function types
import type {
  AssetRebalancedEvent,
  DCAExecutedEvent,
  DelegationUsedEvent,
  PermissionDelegatedEvent,
  RebalanceExecutedEvent,
  EntityContext,
} from './index';

// Loader function types
export type AutoBalancerAgentContract_AssetRebalanced_loader = (params: {
  event: AssetRebalancedEvent;
  context: EntityContext;
}) => void;

export type AutoBalancerAgentContract_DCAExecuted_loader = (params: {
  event: DCAExecutedEvent;
  context: EntityContext;
}) => void;

export type AutoBalancerAgentContract_DelegationUsed_loader = (params: {
  event: DelegationUsedEvent;
  context: EntityContext;
}) => void;

export type AutoBalancerAgentContract_PermissionDelegated_loader = (params: {
  event: PermissionDelegatedEvent;
  context: EntityContext;
}) => void;

export type AutoBalancerAgentContract_RebalanceExecuted_loader = (params: {
  event: RebalanceExecutedEvent;
  context: EntityContext;
}) => void;

// Handler function types
export type AutoBalancerAgentContract_AssetRebalanced_handler = (params: {
  event: AssetRebalancedEvent;
  context: EntityContext;
}) => void;

export type AutoBalancerAgentContract_DCAExecuted_handler = (params: {
  event: DCAExecutedEvent;
  context: EntityContext;
}) => void;

export type AutoBalancerAgentContract_DelegationUsed_handler = (params: {
  event: DelegationUsedEvent;
  context: EntityContext;
}) => void;

export type AutoBalancerAgentContract_PermissionDelegated_handler = (params: {
  event: PermissionDelegatedEvent;
  context: EntityContext;
}) => void;

export type AutoBalancerAgentContract_RebalanceExecuted_handler = (params: {
  event: RebalanceExecutedEvent;
  context: EntityContext;
}) => void;

// Mock implementations for development - These are function definitions that accept handlers
export const AutoBalancerAgentContract_AssetRebalanced_loader = (handler: AutoBalancerAgentContract_AssetRebalanced_loader) => {
  // This would register the loader in the real Envio runtime
};

export const AutoBalancerAgentContract_AssetRebalanced_handler = (handler: AutoBalancerAgentContract_AssetRebalanced_handler) => {
  // This would register the handler in the real Envio runtime
};

export const AutoBalancerAgentContract_DCAExecuted_loader = (handler: AutoBalancerAgentContract_DCAExecuted_loader) => {
  // This would register the loader in the real Envio runtime
};

export const AutoBalancerAgentContract_DCAExecuted_handler = (handler: AutoBalancerAgentContract_DCAExecuted_handler) => {
  // This would register the handler in the real Envio runtime
};

export const AutoBalancerAgentContract_DelegationUsed_loader = (handler: AutoBalancerAgentContract_DelegationUsed_loader) => {
  // This would register the loader in the real Envio runtime
};

export const AutoBalancerAgentContract_DelegationUsed_handler = (handler: AutoBalancerAgentContract_DelegationUsed_handler) => {
  // This would register the handler in the real Envio runtime
};

export const AutoBalancerAgentContract_PermissionDelegated_loader = (handler: AutoBalancerAgentContract_PermissionDelegated_loader) => {
  // This would register the loader in the real Envio runtime
};

export const AutoBalancerAgentContract_PermissionDelegated_handler = (handler: AutoBalancerAgentContract_PermissionDelegated_handler) => {
  // This would register the handler in the real Envio runtime
};

export const AutoBalancerAgentContract_RebalanceExecuted_loader = (handler: AutoBalancerAgentContract_RebalanceExecuted_loader) => {
  // This would register the loader in the real Envio runtime
};

export const AutoBalancerAgentContract_RebalanceExecuted_handler = (handler: AutoBalancerAgentContract_RebalanceExecuted_handler) => {
  // This would register the handler in the real Envio runtime
};

// Re-export types for easy import
export * from './index';