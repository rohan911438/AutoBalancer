
# 🚀 AutoBalancer Pro - Complete DeFi Automation Platform

A comprehensive decentralized finance (DeFi) automation platform that combines automated portfolio rebalancing, Dollar Cost Averaging (DCA), and ERC-7715 delegation permissions in a unified system.
<img width="1920" height="1080" alt="Screenshot (43)" src="https://github.com/user-attachments/assets/b6c9fce1-e0e6-4497-868a-c33b8920470e" />

## Detailed overview — what AutoBalancer does and the problems it solves

AutoBalancer provides safe, auditable automation for token portfolios by combining three capabilities:

- Automated rebalancing: continuously monitor portfolio allocations and perform on-chain rebalances when holdings drift beyond user-configured thresholds. This removes the need for manual monitoring and reduces timing- and emotion-driven mistakes.
- Recurring buys / DCA: schedule repeated purchases across arbitrary token pairs (daily/weekly/etc.) so users can implement DCA strategies reliably without manually signing each transaction.
- Secure delegation: use an on-chain delegation/agent contract (ERC-7715-style) so an operator can execute authorized actions on behalf of a user without custody of funds. Delegations are scoped and revocable.

### Problems AutoBalancer addresses in detail:

- Portfolio drift & timing: price moves change allocations; AutoBalancer detects drift and rebalances to target weights, preserving allocation strategy with minimal manual intervention.
- High transaction overhead for repetitive actions: DCA and frequent rebalances can create many small transactions. AutoBalancer batches or schedules operations to reduce gas friction where possible.
- Trust & custody: users keep custody; the agent is given narrowly scoped permissions that can be revoked on-chain—this minimizes trust and attack surface.
- Observability: all automated actions emit events that are indexed (via `envio-indexer`) to provide audit trails and allow users to verify what happened and why.

### Where this helps users and integrators:

- Retail traders who want set-and-forget strategies (DCA) without custodial risk.
- Portfolio managers who need to maintain target allocations across multiple ERC-20 tokens.
- Developers building integrations that require reliable, auditable automation and permissioned execution.

This section is intentionally additive — the rest of the README keeps existing deployment, architecture diagrams, contract addresses, and setup instructions. Scroll down for architecture, indexer details, and quickstart commands.

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

**GraphQL API**: Available at `http://localhost:8080` when running locally

**Setup**:
```bash
cd envio
npm install
npm run local    # Start Docker containers
npm run dev      # Start indexer
```

**Author & Team**

- **Team:** Brotherhood
- **Maintainer:** Rohan Kumar
- **GitHub:** https://github.com/rohan911438

For support or contributions, open an issue on the repository or contact the maintainer via the GitHub link above.
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
<img width="1920" height="1080" alt="Screenshot (42)" src="https://github.com/user-attachments/assets/54148bc8-e29f-47af-9845-3422ecc84bea" />

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

## 📂 Presentation (PPT)

A presentation (PowerPoint) version of the project overview is available (generated via Claude). You can view or download the PPT here:

- [Download presentation (PPT) — Claude artifact](https://claude.ai/public/artifacts/54f34c15-190f-4b8b-8c24-007ea71ee702)

Use this slide deck for stakeholder briefings, demos, or to export directly into PowerPoint.


