
# 🚀 AutoBalancer Pro - Complete DeFi Automation Platform

A comprehensive decentralized finance (DeFi) automation platform that combines automated portfolio rebalancing, Dollar Cost Averaging (DCA), and ERC-7715 delegation permissions in a unified system.

## 🏗️ Architecture Overview

AutoBalancer Pro consists of four integrated components:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │   Blockchain    │
│   (React)       │◄──►│   (Node.js)      │◄──►│   (Sepolia)     │
│                 │    │                  │    │                 │
│ • User Interface│    │ • API Server     │    │ • Smart Contract│
│ • Wallet Connect│    │ • Automation     │    │ • ERC-7715      │
│ • MetaMask SDK  │    │ • Database       │    │ • Delegations   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                       ▲
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   Envio Indexer │    │    Database      │
│   (GraphQL)     │    │    (SQLite)      │
│                 │    │                  │
│ • Event Tracking│    │ • User Data      │
│ • Real-time Data│    │ • DCA Plans      │
│ • Hasura Engine │    │ • Rebalance Data │
└─────────────────┘    └──────────────────┘
```

## ✨ Features

### 🔄 Automated Portfolio Rebalancing
- **Smart Threshold Detection**: Automatically rebalances when allocations drift beyond set thresholds
- **Multi-Token Support**: Handle complex portfolios with multiple ERC-20 tokens
- **Gas Optimization**: Intelligent batching and timing to minimize transaction costs

### 💰 Dollar Cost Averaging (DCA)
- **Flexible Scheduling**: Set custom intervals (daily, weekly, monthly)
- **Multi-Asset DCA**: Create DCA plans for multiple token pairs
- **Automated Execution**: Set-and-forget automation with full control

### 🔐 ERC-7715 Delegation System
- **Permission Management**: Granular control over wallet permissions
- **Secure Delegations**: Cryptographically secure permission delegation
- **Revocable Access**: Full control over granted permissions

### 📊 Real-Time Analytics
- **Live Portfolio Tracking**: Real-time balance and allocation monitoring
- **Historical Data**: Complete transaction and rebalance history
- **Performance Metrics**: ROI calculations and performance analytics


## 🔗 Smart Contract Deployment

### AutoBalancerAgent Contract - Ethereum Sepolia Testnet

**Contract Address**: [`0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815`](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815)

**Network**: Ethereum Testnet Sepolia (Chain ID: 11155111)

**Deployment Details**:

**Live App**: https://autobalancer.lovable.app
## 🔍 Event Indexing

### Envio Indexer

The project includes a comprehensive Envio indexer that tracks all contract events for analytics and monitoring:

**Location**: `/envio/`

**Indexed Events**:
- `DCAExecuted` - DCA strategy executions
- `RebalanceExecuted` - Portfolio rebalancing operations
- `PermissionDelegated` - Permission delegation events
- `DelegationUsed` - Permission usage tracking
- `AssetRebalanced` - Individual asset movements

**GraphQL API**: Available at `http://localhost:8080` when running locally

**Setup**:
```bash
cd envio
npm install
npm run local    # Start Docker containers
npm run dev      # Start indexer
```

See [envio/README.md](envio/README.md) for detailed setup and usage instructions.
- **Deployment Transaction**: [`0xbf42576501199b6966dc7d48fa4b28a18677311ef374f30ab57403fb894afbab`](https://sepolia.etherscan.io/tx/0xbf42576501199b6966dc7d48fa4b28a18677311ef374f30ab57403fb894afbab)
- **Block Number**: 9,911,574
- **Transaction Index**: 31
- **Deployment Date**: December 25, 2025 11:52:37 UTC

**Contract Verification**:
- **Compiler Version**: solc 0.8.31+commit.fd3a2265
- **EVM Version**: default
- **Optimization**: Disabled
- **Contract Source**: Verified (Exact Match)
- **Verification Date**: December 25, 2025 17:22:37 (+05:30 UTC)

**Etherscan Links**:
- [View Contract](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815)
- [Contract Code](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815#code)
- [Read Contract](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815#readContract)
- [Write Contract](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815#writeContract)
- [Contract ABI](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815#code)

## 🛠️ Technology Stack

**Frontend**:
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Web3 Integration** for blockchain interaction

**Backend**:
- **Node.js** with TypeScript
- **Express.js** server framework
- **Database Layer** for persistent storage
- **Scheduler Service** for automated executions

**Smart Contracts**:
- **Solidity 0.8.31**
- **OpenZeppelin** contracts for security
- **Ethereum Sepolia Testnet** deployment

**Development Tools**:
- **ESLint** for code linting
- **PostCSS** for CSS processing
- **Bun** for package management

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 18.0.0)
- npm or bun
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH for testing

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd autobalancer-pro

# Install frontend dependencies
npm install
# or
bun install

# Navigate to backend directory
cd backend

# Install backend dependencies
npm install
# or
bun install
```

### Environment Setup

#### Backend Configuration

1. Copy the example environment file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `.env` and configure:
   ```env
   # Ethereum Configuration - Sepolia Testnet
   ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
   PRIVATE_KEY=your_private_key_here
   AGENT_CONTRACT_ADDRESS=0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815
   ```

3. Get a Sepolia RPC URL:
   - **Infura**: Sign up at [infura.io](https://infura.io), create a project, and use the Sepolia endpoint
   - **Alchemy**: Sign up at [alchemy.com](https://alchemy.com) and create an app for Sepolia

4. **Important**: Use a test wallet private key with minimal Sepolia ETH. Never use mainnet funds!

#### Frontend Configuration

1. Copy the example environment file:
   ```bash
   # From project root
   cp .env.example .env
   ```

2. Edit `.env` and configure:
   ```env
   # Frontend Configuration
   VITE_API_BASE_URL=http://localhost:3001
   VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
   VITE_CONTRACT_ADDRESS=0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815
   VITE_CHAIN_ID=11155111
   ```

### Development

```bash
# Start backend server
cd backend
npm run dev
# or
bun run dev

# Start frontend development server (in separate terminal)
cd ..  # back to project root
npm run dev
# or
bun run dev
```

### Testing the Contract Integration

Run the integration test to verify everything is working:

```bash
# Test contract integration
node test-contract-integration.js
```

This will test:
- ✅ Contract connectivity
- ✅ Environment configuration
- ✅ ABI compatibility
- ✅ Basic contract functions

### Wallet Setup

1. **Install MetaMask**: [metamask.io](https://metamask.io)

2. **Add Sepolia Network** to MetaMask:
   - Network Name: `Sepolia`
   - RPC URL: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
   - Chain ID: `11155111`
   - Currency Symbol: `SepoliaETH`
   - Block Explorer: `https://sepolia.etherscan.io`

3. **Get Sepolia ETH**:
   - [Sepolia Faucet](https://sepoliafaucet.com/)
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - [Chainlink Sepolia Faucet](https://faucets.chain.link/sepolia)

### First Steps

1. **Connect Your Wallet**: Visit the application and connect MetaMask
2. **Verify Contract**: The app will automatically connect to the deployed contract
3. **Test DCA**: Create a test DCA plan (simulated for hackathon)
4. **Test Rebalancing**: Set up portfolio rebalancing targets
5. **Monitor Events**: Check the console/backend logs for contract events

### Testing

```bash
# Run integration tests
npm run test

# Test MetaMask integration
# Open metamask-test.html in browser

# Run wallet debug tests
# Open wallet-debug.html in browser
```

## 📁 Project Structure

```
├── src/                    # Frontend React application
├── backend/                # Backend Node.js server
├── contracts/              # Smart contracts
├── public/                 # Static assets
├── components.json         # shadcn/ui configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── vite.config.ts          # Vite configuration
└── package.json           # Project dependencies
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in both root and backend directories:

**Frontend (.env)**:
```env
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
VITE_CONTRACT_ADDRESS=0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815
VITE_CHAIN_ID=11155111
```

**Backend (backend/.env)**:
```env
PORT=3001
CONTRACT_ADDRESS=0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_for_automated_operations
```

## 📖 Usage

1. **Connect Wallet**: Use MetaMask to connect to Sepolia testnet
2. **Set Permissions**: Grant necessary permissions to the AutoBalancer agent
3. **Create Strategies**: Set up rebalancing or DCA plans
4. **Monitor**: Track performance through the dashboard

## 🔐 Security

- All smart contracts are verified on Etherscan
- Permission-based system for granular control
- Non-custodial design - users maintain control of their assets
- Extensive testing and error handling

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support and questions, please open an issue in the repository.

## 🚀 Deployment Guide (detailed)

This repository contains a Vite React frontend at the repository root and a Node/Express backend in `backend/`.

Quick recommendation
- Frontend: deploy to Vercel (good fit for Vite static apps)
- Backend: deploy to a container or process host with persistent storage (Render, Railway, Fly, or a Docker host)

Useful links
- Vercel: https://vercel.com/
- Render: https://render.com/
- Railway: https://railway.app/
- Fly: https://fly.io/
- Infura: https://infura.io/
- Alchemy: https://www.alchemy.com/
- Etherscan Sepolia: https://sepolia.etherscan.io/
- MetaMask: https://metamask.io/

1) Deploy backend (Render example)

- Create a new **Web Service** on Render and point it to this repository (branch: `main`).
- Settings (copy/paste):
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install --include=dev && npm run build`
   - Start Command: `npm run start`
   - Health Check Path: `/health`
   - Instance Type: `Starter` (or `Standard` for production)
   - Instances: `1` (if you plan to run `node-cron` in-process; otherwise use a cron job / worker)

- Environment variables (set in Render > Environment):
   - `PORT=3001`
   - `NODE_ENV=production`
   - `ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID` (or Alchemy URL)
   - `PRIVATE_KEY=<YOUR_PRIVATE_KEY>` (mark as secret)
   - `AGENT_CONTRACT_ADDRESS=0x...` (your deployed contract address)
   - `ALLOWED_ORIGINS=*` (or your frontend URL)
   - `SQLITE_DB_PATH=./data/database.sqlite` (if using SQLite) — note persistent disk required on Render paid plans
   - `SCHEDULER_INTERVAL_MINUTES=5`

Notes for backend:
- Prefer a managed DB (Postgres) for production. Use Render Postgres and set `DATABASE_URL` if migrating from SQLite.
- If you keep `node-cron` in-process, run a single instance and enable persistent disk (paid) for SQLite.
- Alternative: create a Render Cron Job that calls a protected POST endpoint (e.g. `/internal/run-scheduler`) and remove in-process cron.

2) Deploy frontend to Vercel

- Create a new project on Vercel and connect this repo.
- Settings (copy/paste):
   - Root Directory: `.` (repo root)
   - Framework Preset: `Vite`
   - Install Command: `npm install`
   - Build Command: `npm run build:frontend`
   - Output Directory: `dist`

- Environment variables (Vercel > Project Settings > Environment Variables):
```
VITE_API_BASE_URL=https://<your-backend-url>
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
VITE_CONTRACT_ADDRESS=0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815
VITE_CHAIN_ID=11155111
```

3) Vercel serverless proxy option (optional)

If you prefer having the frontend call `/api/*` on the same domain, a small serverless proxy is included at `api/proxy/[...path].ts`. Configure `BACKEND_URL` or `VITE_API_BASE_URL` in Vercel to point to your backend and Vercel will forward requests.

4) Local reproduction commands (what I run locally to replicate CI)
```
# Frontend build
npm ci
npm run build:frontend

# Backend build & start (from repo root)
cd backend
npm install --include=dev
npm run build
npm run start
```

5) Common issues and fixes
- `tsc: command not found` — ensure devDependencies (TypeScript, @types/*) are installed during build. Use `npm install --include=dev` in your host build step or use a multi-stage Dockerfile (this repo includes `backend/Dockerfile`).
- Missing types (`Cannot find module 'express' or its corresponding type declarations`) — install `@types/express`, `@types/node`, and other `@types/*` packages as devDependencies.
- SQLite persistence — Render requires a persistent disk (paid) if you want to keep the SQLite file between restarts. Prefer managed Postgres for production.
- Cron duplication — avoid multiple instances when running in-process cron; use a single instance or move scheduling to a cron job / worker.

6) Helpful links and examples
- Render web services: https://render.com/docs/deploy-nodejs
- Vercel docs for Vite apps: https://vercel.com/docs/frameworks/vite
- Creating Environment Variables on Vercel: https://vercel.com/docs/environment-variables
- Render Cron Jobs: https://render.com/docs/cron-jobs

If you want I can:
- add `backend/README.md` with Render + Docker instructions and a sample Procfile,
- add a protected `/internal/run-scheduler` endpoint and example Render Cron Job configuration,
- or prepare a one-click Vercel/Render deploy guide with exact UI screenshots.

