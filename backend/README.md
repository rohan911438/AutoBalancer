# AutoBalancer Backend

A comprehensive Node.js + TypeScript backend for automated DCA (Dollar Cost Averaging) and portfolio rebalancing using MetaMask Advanced Permissions (ERC-7715).

## 🚀 Features

- **Automated DCA Execution**: Schedule and execute dollar-cost averaging strategies
- **Portfolio Rebalancing**: Maintain target allocations across multiple tokens
- **ERC-7715 Permissions**: Secure delegation using MetaMask Advanced Permissions
- **RESTful API**: Complete API for managing plans, configurations, and permissions
- **Real-time Monitoring**: Comprehensive logging and statistics
- **Automated Scheduling**: Cron-based execution every minute with error recovery

## 🏗️ Architecture

```
src/
├── api/               # REST API endpoints
│   ├── plans.ts       # DCA plan management
│   ├── rebalancer.ts  # Rebalancer configuration
│   ├── delegation.ts  # Permission delegation
│   └── permissions.ts # Permission validation
├── contracts/         # Smart contract wrappers
│   ├── AgentContract.ts
│   └── agent.ts
├── services/          # Core business logic
│   ├── database.ts    # Data persistence layer
│   ├── dcaEngine.ts   # DCA execution engine
│   ├── rebalanceEngine.ts  # Rebalancing engine
│   └── scheduler.ts   # Automated task scheduler
├── utils/             # Utility functions
│   ├── logger.ts      # Winston logging configuration
│   ├── validation.ts  # Input validation helpers
│   └── time.ts        # Time utilities
├── config.ts          # Application configuration
└── index.ts           # Main server entry point
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+ with npm or bun
- MetaMask wallet with ERC-7715 support
- Ethereum RPC endpoint (Infura, Alchemy, etc.)

### Setup

1. **Clone and navigate to backend directory**:
```bash
cd autobalancer-pro/backend
```

2. **Install dependencies**:
```bash
npm install
# OR
bun install
```

3. **Configure environment** (create `.env` file):
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Blockchain Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
AGENT_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
PRIVATE_KEY=your_agent_private_key_here

# Scheduler Configuration
SCHEDULER_INTERVAL_MINUTES=1

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/autobalancer.log
```

4. **Build the project**:
```bash
npm run build
# OR
bun run build
```

5. **Start the server**:
```bash
npm start
# OR
bun start
```

For development with hot reload:
```bash
npm run dev
# OR
bun run dev
```

## 📖 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
All endpoints require valid ERC-7715 permissions. Users must delegate permissions to the agent contract before creating plans or configurations.

---

### DCA Plans

#### Create DCA Plan
```http
POST /api/plans
Content-Type: application/json

{
  "userAddress": "0x742d35Cc6463C400E5f7d5637a6b9e2DD0F999",
  "tokenIn": "0xA0b86a33E6351Ccb52e7Afa4E71e9Acf1C4f8E9a",
  "tokenOut": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  "amountPerExecution": "100",
  "frequency": 3600,
  "totalExecutions": 30,
  "minPrice": "0",
  "maxPrice": "10000",
  "isActive": true
}
```

#### Get User's DCA Plans
```http
GET /api/plans?userAddress=0x742d35Cc6463C400E5f7d5637a6b9e2DD0F999
```

#### Update DCA Plan
```http
PUT /api/plans/:planId
Content-Type: application/json

{
  "amountPerExecution": "150",
  "isActive": false
}
```

#### Delete DCA Plan
```http
DELETE /api/plans/:planId
```

---

### Rebalancer Configurations

#### Create Rebalancer Configuration
```http
POST /api/rebalancer
Content-Type: application/json

{
  "userAddress": "0x742d35Cc6463C400E5f7d5637a6b9e2DD0F999",
  "name": "My Portfolio",
  "targets": [
    {
      "tokenAddress": "0xA0b86a33E6351Ccb52e7Afa4E71e9Acf1C4f8E9a",
      "percentage": 60
    },
    {
      "tokenAddress": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "percentage": 40
    }
  ],
  "deviationThreshold": 5,
  "minExecutionAmount": "50",
  "isActive": true
}
```

#### Get User's Rebalancer Configurations
```http
GET /api/rebalancer?userAddress=0x742d35Cc6463C400E5f7d5637a6b9e2DD0F999
```

---

### Delegation Management

#### Get Delegation Status
```http
GET /api/delegation/status/0x742d35Cc6463C400E5f7d5637a6b9e2DD0F999
```

#### Create Delegation
```http
POST /api/delegation/create
Content-Type: application/json

{
  "userAddress": "0x742d35Cc6463C400E5f7d5637a6b9e2DD0F999",
  "signature": "0x1234...",
  "permissions": [
    {
      "tokenAddress": "0xA0b86a33E6351Ccb52e7Afa4E71e9Acf1C4f8E9a",
      "amount": "1000",
      "expiry": 1735689600
    }
  ]
}
```

#### Revoke Delegation
```http
POST /api/delegation/revoke
Content-Type: application/json

{
  "userAddress": "0x742d35Cc6463C400E5f7d5637a6b9e2DD0F999",
  "signature": "0x5678..."
}
```

---

### Permissions Management

#### Get User Permissions
```http
GET /api/permissions/0x742d35Cc6463C400E5f7d5637a6b9e2DD0F999
```

#### Validate Permission
```http
POST /api/permissions/validate
Content-Type: application/json

{
  "userAddress": "0x742d35Cc6463C400E5f7d5637a6b9e2DD0F999",
  "tokenAddress": "0xA0b86a33E6351Ccb52e7Afa4E71e9Acf1C4f8E9a",
  "amount": "100",
  "operation": "dca"
}
```

#### Get Permission Usage History
```http
GET /api/permissions/0x742d35Cc6463C400E5f7d5637a6b9e2DD0F999/usage?limit=20&offset=0
```

---

### System Monitoring

#### Health Check
```http
GET /api/health
```

#### Get Statistics
```http
GET /api/stats
```

#### Get Scheduler Status
```http
GET /api/scheduler/status
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|-----------|
| `PORT` | Server port | `3001` | No |
| `NODE_ENV` | Environment | `development` | No |
| `ETHEREUM_RPC_URL` | Ethereum RPC endpoint | - | Yes |
| `AGENT_CONTRACT_ADDRESS` | Agent contract address | - | Yes |
| `PRIVATE_KEY` | Agent private key | - | Yes |
| `SCHEDULER_INTERVAL_MINUTES` | Execution frequency | `1` | No |
| `LOG_LEVEL` | Logging level | `info` | No |
| `LOG_FILE` | Log file path | `logs/autobalancer.log` | No |

### Supported Networks

- Ethereum Mainnet
- Ethereum Sepolia (Testnet)
- Polygon
- Arbitrum
- Optimism

## 🎯 Core Services

### DCA Engine
Executes dollar-cost averaging plans automatically:
- **Time Window Validation**: Ensures executions happen at correct intervals
- **Permission Checking**: Validates ERC-7715 permissions before execution
- **Price Range Filtering**: Skips executions outside defined price ranges
- **Gas Optimization**: Batches multiple executions when possible

### Rebalance Engine
Maintains target portfolio allocations:
- **Deviation Analysis**: Calculates current vs target allocations
- **Multi-token Rebalancing**: Handles complex rebalancing scenarios
- **Threshold Management**: Only rebalances when deviation exceeds threshold
- **Slippage Protection**: Implements maximum slippage controls

### Scheduler Service
Orchestrates automated execution:
- **Cron-based Scheduling**: Runs every minute with configurable intervals
- **Error Recovery**: Implements exponential backoff for failures
- **Health Monitoring**: Tracks execution statistics and uptime
- **Emergency Stop**: Provides circuit breaker functionality

## 📊 Database Schema

The application uses JSON file-based storage for development and can be easily extended to use PostgreSQL, MongoDB, or other databases in production.

### Data Models

#### DCA Plan
```typescript
interface DcaPlan {
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
```

#### Rebalancer Configuration
```typescript
interface RebalancerConfig {
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
```

## 🔒 Security

### ERC-7715 Permissions
- **Signature Verification**: All permissions verified using cryptographic signatures
- **Expiry Management**: Time-bound permissions with automatic expiry
- **Amount Limits**: Per-token spending limits enforced
- **Revocation Support**: Users can revoke permissions at any time

### Best Practices
- **Input Validation**: All inputs validated using Joi schemas
- **Rate Limiting**: API endpoints protected against abuse
- **Error Handling**: Comprehensive error handling with logging
- **Private Key Security**: Agent private key never logged or exposed

## 🚨 Monitoring & Logging

### Winston Logging
- **Structured Logging**: JSON format for easy parsing
- **Log Levels**: DEBUG, INFO, WARN, ERROR, FATAL
- **File Rotation**: Daily log files with compression
- **Console Output**: Colored output for development

### Metrics Tracked
- **Execution Statistics**: Success/failure rates, execution times
- **Permission Usage**: Token spending, operation counts
- **System Health**: Uptime, error rates, memory usage
- **User Activity**: Active plans, configuration changes

## 🧪 Testing

```bash
# Run unit tests
npm test
# OR
bun test

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Deployment

1. **Environment Configuration**:
```bash
NODE_ENV=production
LOG_LEVEL=warn
```

2. **Database Migration** (if using SQL database):
```bash
npm run migrate
```

3. **Process Management** (using PM2):
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

4. **Load Balancer Configuration**:
```nginx
upstream autobalancer {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    location /api {
        proxy_pass http://autobalancer;
    }
}
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs on GitHub Issues
- **Documentation**: Check the `/docs` folder for detailed guides
- **Community**: Join our Discord server for discussions

---

**AutoBalancer Backend** - Automated DCA and Portfolio Rebalancing with ERC-7715 Permissions