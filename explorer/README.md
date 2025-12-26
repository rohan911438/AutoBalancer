# AutoBalancer Explorer Envio Indexer

This is the official Envio indexer for the AutoBalancer Agent contract explorer, created for hackathon submission.

## Contract Information

- **Contract Address**: `0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815`
- **Network**: Ethereum Sepolia (Chain ID: 11155111)
- **Start Block**: 7444444

## Indexed Events

This explorer indexes all events from the AutoBalancer Agent contract:

1. **AssetRebalanced** - Individual asset rebalancing operations
2. **DCAExecuted** - Dollar Cost Averaging executions  
3. **DelegationUsed** - Usage of delegated permissions
4. **PermissionDelegated** - Permission delegation events
5. **RebalanceExecuted** - Portfolio rebalancing operations

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Ethereum Sepolia RPC access

### Installation

```bash
# Install dependencies
npm install

# Generate TypeScript types
npm run codegen

# Start local infrastructure (PostgreSQL + Hasura)
npm run local

# Start the indexer
npm run dev
```

### Access Explorer

Once running:
- **Hasura Console**: http://localhost:8080
- **GraphQL Endpoint**: http://localhost:8080/v1/graphql

## Project Structure

```
explorer/
├── config.yaml              # Envio configuration
├── schema.graphql           # GraphQL schema
├── src/
│   └── EventHandlers.ts     # Event processing logic
├── abis/
│   └── AutoBalancerAgent.json # Contract ABI
├── package.json
└── README.md
```

## Example Queries

```graphql
# Get recent DCA executions
query RecentDCA {
  DCAExecuted(limit: 10, order_by: {block_timestamp: desc}) {
    user
    tokenFrom
    tokenTo
    amount
    executedAt
    transaction_hash
  }
}

# Get rebalancing operations
query RebalanceOperations {
  RebalanceExecuted(limit: 10, order_by: {block_timestamp: desc}) {
    user
    totalAssets
    totalValue
    executedAt
    transaction_hash
  }
}

# Get permission delegations
query Delegations {
  PermissionDelegated(limit: 10, order_by: {block_timestamp: desc}) {
    delegator
    delegatee
    allowance
    createdAt
    transaction_hash
  }
}
```

This indexer provides comprehensive event tracking for the AutoBalancer protocol, enabling rich analytics and real-time monitoring of all contract activities.