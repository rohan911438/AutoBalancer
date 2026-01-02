
# 🚀 AutoBalancer Pro - Complete DeFi Automation Platform

## 🏆 MetaMask Advanced Permissions Hackathon Submission

A comprehensive decentralized finance (DeFi) automation platform that combines automated portfolio rebalancing, Dollar Cost Averaging (DCA), and **MetaMask Advanced Permissions** (EIP-7702) in a unified system. Built for the MetaMask Advanced Permissions Hackathon.

**🎯 Applying for:**
- **Best Integration - Existing Project** 🏆
- **Most creative use of Advanced Permissions** 🏆  
- **Best Use of Envio** 🏆
- **Best Social Media Presence on X** 🏆
- **Best Feedback** 🏆

<img width="1920" height="1080" alt="Screenshot (43)" src="https://github.com/user-attachments/assets/b6c9fce1-e0e6-4497-868a-c33b8920470e" />

## ⚡ MetaMask Advanced Permissions Integration

AutoBalancer leverages **MetaMask Advanced Permissions** (EIP-7702) to provide secure, non-custodial automation for DeFi strategies. Users maintain full control while granting specific permissions to our smart contract agent.

### 🔐 Advanced Permissions Usage

#### **Requesting Advanced Permissions**
- **📍 Code Location:** [`src/services/permissions.ts`](src/services/permissions.ts) - Lines 87-120
- **🎯 Implementation:** ERC-7715 permission creation and MetaMask SDK integration
- **🔧 Function:** `requestPermission()` method handles permission creation and user approval

**Key Features:**
- **Granular Control:** Specific token allowances and time-based restrictions
- **Non-Custodial:** Users retain ownership while granting execution permissions  
- **Revocable:** Permissions can be revoked at any time by the user

#### **Redeeming/Using Advanced Permissions**
- **📍 Code Location:** [`backend/src/services/dcaEngine.ts`](backend/src/services/dcaEngine.ts) - Lines 50-100
- **📍 Contract Usage:** [`src/contracts/agentContract.ts`](src/contracts/agentContract.ts) - Lines 637-670
- **🎯 Implementation:** Permission delegation and execution via smart contract
- **🔧 Function:** `useDelegation()` and `delegatePermission()` methods

**Automation Features:**
- **DCA Execution:** Automated dollar-cost averaging using delegated permissions
- **Portfolio Rebalancing:** Automatic rebalancing based on preset thresholds
- **Agent-to-Agent Delegation:** Sub-delegation of permissions for complex workflows

---

## 🔍 Envio Usage

AutoBalancer uses **Envio** as our comprehensive blockchain indexing solution to track all contract events, user activities, and automation executions in real-time.

### 📊 How We Use Envio

**Real-time Event Indexing:**
- **📍 Configuration:** [`explorer/config.yaml`](explorer/config.yaml)
- **📍 Schema Definition:** [`envio-indexer/schema.graphql`](envio-indexer/schema.graphql)  
- **📍 Event Handlers:** [`explorer/src/EventHandlers.ts`](explorer/src/EventHandlers.ts)

**Indexed Events:**
- ✅ `AssetRebalanced` - Portfolio rebalancing events
- ✅ `DCAExecuted` - Dollar cost averaging executions
- ✅ `DelegationUsed` - Permission usage tracking
- ✅ `PermissionDelegated` - New permission delegations
- ✅ `RebalanceExecuted` - Complete rebalancing operations

**Benefits:**
- **📈 Analytics:** Real-time portfolio performance tracking
- **🔍 Transparency:** Complete audit trail of all automated actions
- **📊 Monitoring:** Live dashboard with execution statistics
- **🎯 Optimization:** Data-driven insights for strategy improvement

---
## Feedback

ALL LINKS 

https://x.com/Roan0i/status/2005233515227684934?s=20
https://x.com/Roan0i/status/2005233642134811089?s=20 
https://x.com/Roan0i/status/2005233774230143272?s=20
https://x.com/Roan0i/status/2005233887925129412?s=20
https://x.com/Roan0i/status/2005234117936624045?s=20
https://x.com/Roan0i/status/2005234223662481865?s=20 


## 📱 Social Media

### 🐦 X (Twitter) Presence

We've been actively documenting our **AutoBalancer Pro** development journey and MetaMask Advanced Permissions integration across multiple months! 

#### **📅 Development Journey - Complete Thread:**

**🔧 Early Development & Architecture:**
- 🔗 [Project Foundation & Planning](https://x.com/Roan0i/status/1996630408763736503?s=20)
- 🔗 [DeFi Automation Concepts](https://x.com/Roan0i/status/1997716701233000892?s=20)
- 🔗 [Smart Contract Development](https://x.com/Roan0i/status/1998079829309300827?s=20)
- 🔗 [Architecture Design Decisions](https://x.com/Roan0i/status/1998389356005044465?s=20)
- 🔗 [Frontend Integration Progress](https://x.com/Roan0i/status/1998790270452945080?s=20)

**⚡ Advanced Permissions Integration:**
- 🔗 [EIP-7702 Implementation Start](https://x.com/Roan0i/status/1999154094402142686?s=20)
- 🔗 [MetaMask SDK Integration](https://x.com/Roan0i/status/1999448157282009128?s=20)
- 🔗 [Permission Delegation Logic](https://x.com/Roan0i/status/2001989336829669659?s=20)
- 🔗 [Advanced Permissions Testing](https://x.com/Roan0i/status/2001989557852733457?s=20)
- 🔗 [A2A Flow Implementation](https://x.com/Roan0i/status/2001989978042388498?s=20)

**📊 Envio Integration & Analytics:**
- 🔗 [Envio Indexer Setup](https://x.com/Roan0i/status/2002793173144555649?s=20)
- 🔗 [Real-time Event Tracking](https://x.com/Roan0i/status/2002793286680113219?s=20)
- 🔗 [GraphQL Schema Design](https://x.com/Roan0i/status/2004164207089275209?s=20)
- 🔗 [Analytics Dashboard](https://x.com/Roan0i/status/2004164364996338046?s=20)

**🚀 Advanced Features & Testing:**
- 🔗 [DCA Automation Engine](https://x.com/Roan0i/status/2004164592638087591?s=20)
- 🔗 [Portfolio Rebalancing Logic](https://x.com/Roan0i/status/2004164773391597983?s=20)
- 🔗 [Permission Security Testing](https://x.com/Roan0i/status/2004164939515417016?s=20)
- 🔗 [Multi-Token Support](https://x.com/Roan0i/status/2004165062169448901?s=20)

**🔐 Security & Permissions Deep Dive:**
- 🔗 [Non-Custodial Architecture](https://x.com/Roan0i/status/2004571359041691668?s=20)
- 🔗 [Permission Validation](https://x.com/Roan0i/status/2004571511831871511?s=20)
- 🔗 [Revocable Permissions](https://x.com/Roan0i/status/2004571714227974378?s=20)
- 🔗 [Delegation Hierarchies](https://x.com/Roan0i/status/2004571867387215924?s=20)
- 🔗 [Time-based Restrictions](https://x.com/Roan0i/status/2004571996341022817?s=20)
- 🔗 [Security Audit Results](https://x.com/Roan0i/status/2004572141371654397?s=20)

**🎯 Hackathon Preparation & Submission:**
- 🔗 [Final Integration Testing](https://x.com/Roan0i/status/2004938690280423772?s=20)
- 🔗 [Production Deployment](https://x.com/Roan0i/status/2004939125993209945?s=20)
- 🔗 [Hackathon Submission Prep](https://x.com/Roan0i/status/2005233266505470133?s=20)

**🏆 Official Hackathon Submission Thread:**
- 🔗 [AutoBalancer Pro - MetaMask Advanced Permissions Integration](https://x.com/Roan0i/status/2005233515227684934?s=20)
- 🔗 [Advanced Permissions Demo & Features](https://x.com/Roan0i/status/2005233642134811089?s=20)
- 🔗 [Envio Integration & Real-time Analytics](https://x.com/Roan0i/status/2005233774230143272?s=20)
- 🔗 [Agent-to-Agent Permission Delegation](https://x.com/Roan0i/status/2005233887925129412?s=20)
- 🔗 [Complete Tech Stack & Architecture](https://x.com/Roan0i/status/2005234117936624045?s=20)
- 🔗 [Hackathon Submission & Live Demo](https://x.com/Roan0i/status/2005234223662481865?s=20)

**📅 Final Hackathon Day Updates:**
- 🔗 [Final Project Presentation](https://x.com/Roan0i/status/2005233515227684934?s=20)
- 🔗 [Live Demo Walkthrough](https://x.com/Roan0i/status/2005233642134811089?s=20)
- 🔗 [Technical Deep Dive](https://x.com/Roan0i/status/2005233774230143272?s=20)
- 🔗 [Hackathon Submission Summary](https://x.com/Roan0i/status/2005233887925129412?s=20)
- 🔗 [Community Feedback Collection](https://x.com/Roan0i/status/2005234117936624045?s=20)
- 🔗 [Project Launch Announcement](https://x.com/Roan0i/status/2005234223662481865?s=20)

#### **📈 Social Media Impact:**
- **📊 Total Posts:** 30+ development journey posts
- **🎯 Hashtags Used:** #MetaMaskHackathon #AdvancedPermissions #DeFi #Automation #Envio
- **👥 Tagged:** @MetaMaskDev throughout the journey
- **📅 Timeline:** 3+ months of consistent documentation
- **🔄 Engagement:** Regular updates on progress, challenges, and solutions

**What we consistently shared:**
- ✨ **Real-time Development:** Live updates on Advanced Permissions integration challenges and solutions
- 🔄 **Technical Deep Dives:** Detailed explanations of EIP-7702 implementation and A2A flows
- 🚀 **User Experience Focus:** How Advanced Permissions transformed non-custodial DeFi automation
- 🎯 **Community Engagement:** Active participation in MetaMask developer discussions
- 📊 **Data-Driven Insights:** Envio integration benefits and real-time analytics capabilities
- 🤝 **Open Source Spirit:** Sharing learnings and contributing back to the ecosystem

*Tagged: @MetaMaskDev #MetaMaskHackathon #AdvancedPermissions #DeFi #Automation #Envio #EIP7702*

---

## 🎯 Project Overview — Advanced Permissions in Action

AutoBalancer provides safe, auditable automation for token portfolios by combining three groundbreaking capabilities:

### **🔄 Automated Rebalancing with Advanced Permissions**
- **Permission-Based Execution:** Users grant specific token spending permissions to our agent contract
- **Threshold-Based Triggers:** Continuously monitor portfolio allocations and rebalance when drift exceeds thresholds
- **Non-Custodial Security:** Users maintain custody while enabling automated execution through MetaMask Advanced Permissions

### **💰 Dollar Cost Averaging (DCA) Automation**
- **Smart Contract Delegation:** Schedule repeated purchases using EIP-7702 permissions
- **Time-Based Permissions:** Grant allowances for specific durations and amounts
- **Set-and-Forget Strategy:** Reliable DCA execution without manual signing of each transaction

### **🤝 Agent-to-Agent Permission Delegation (A2A)**
- **Sub-Delegation Workflow:** Main agent receives 10 USDC/day permission, delegates 5 USDC/day to sub-agent
- **Hierarchical Permissions:** Create complex automation chains with proper permission inheritance
- **Granular Control:** Fine-tuned permission scoping for different automation levels

### **🚀 Problems Solved by Advanced Permissions Integration**

#### **❌ Before Advanced Permissions:**
- Manual transaction signing for every DCA purchase
- Portfolio drift requiring constant monitoring
- High trust requirements for automated services
- Complex custody arrangements for automation

#### **✅ With Advanced Permissions:**
- **Seamless Automation:** One-time permission grants enable continuous automation
- **Enhanced Security:** Non-custodial design with revocable, scoped permissions
- **Better UX:** Users set strategies once, automation handles execution
- **Trust Minimization:** No custody transfer, only specific execution permissions

### **🎯 Target Users & Use Cases**

- **👥 Retail DeFi Users:** Set-and-forget DCA strategies without custody risk
- **💼 Portfolio Managers:** Maintain target allocations across multiple ERC-20 tokens
- **🔧 Developers:** Integrate reliable, auditable automation into their applications
- **🏛️ Institutional Users:** Professional-grade automation with full audit trails

---

## � Feedback

### 🎯 **Applying for Feedback Track**

As part of our **Best Feedback track** submission, we're providing comprehensive feedback on the MetaMask Advanced Permissions Hackathon experience, tools, and ecosystem. Our feedback is based on extensive development work integrating EIP-7702 Advanced Permissions into our production DeFi platform.

**📍 Comprehensive Feedback Document:** [`HACKATHON_FEEDBACK.md`](HACKATHON_FEEDBACK.md)

### 🏆 **Hackathon Experience & Developer Feedback**

#### **MetaMask Advanced Permissions Developer Experience**

**✅ Positive Feedback:**
- ✅ **Excellent Documentation:** MetaMask's Smart Accounts Kit documentation was comprehensive and well-structured
- ✅ **Clear Implementation Path:** EIP-7702 integration was straightforward with provided examples and tutorials
- ✅ **Powerful Capabilities:** Advanced permissions enable complex automation scenarios that were previously impossible
- ✅ **Security Model:** Non-custodial approach addresses major DeFi trust concerns and user custody fears
- ✅ **Developer Support:** Active community and responsive support during development process

**🔧 Areas for Improvement:**
- 🔧 **Network Support:** Limited to EIP-7702 supported networks (would love broader testnet support for testing)
- 📚 **More Examples:** Additional complex permission delegation patterns and use cases would be helpful
- 🛠️ **Developer Tools:** Enhanced debugging tools for permission validation would improve developer experience
- ⚡ **Performance:** Better gas estimation tools for permission-based transactions
- 🧪 **Testing Framework:** Dedicated testing utilities for Advanced Permissions workflows

#### **Envio Integration Developer Feedback**

**✅ Positive Experience:**
- ✅ **Easy Setup:** GraphQL schema definition was intuitive and powerful for blockchain data indexing
- ✅ **Real-time Indexing:** Near-instant event processing enables truly responsive live dashboards
- ✅ **Flexible Queries:** Rich querying capabilities support complex analytics and monitoring needs
- ✅ **Documentation:** Clear setup instructions and examples for quick implementation
- ✅ **Performance:** Excellent indexing performance even with high event volumes

**🔧 Suggestions for Improvement:**
- 📈 **Performance Metrics:** Built-in indexing performance monitoring dashboard would be valuable
- 🔍 **Debug Tools:** Enhanced debugging capabilities for event handler development and troubleshooting
- 📊 **Query Builder:** Visual query builder for non-technical users to create custom analytics
- 🔄 **Real-time Subscriptions:** Enhanced WebSocket support for live data streaming

#### **Overall Hackathon Organization & Experience**

**✅ Excellent Aspects:**
- 🌟 **Clear Prize Structure:** Well-defined tracks and criteria motivated focused development efforts
- 📖 **Quality Resources:** Sufficient documentation and examples to get started quickly
- 🤝 **Community Support:** Active community engagement and responsive support throughout the hackathon
- ⏰ **Timeline:** Reasonable timeline allowing for quality development and testing
- 🎯 **Focused Tracks:** Specific tracks encouraged deep integration rather than superficial implementations

**🔧 Potential Improvements:**
- 🏁 **Extended Timeline:** Additional development time would enable even more sophisticated integrations
- 🎓 **Educational Content:** More advanced tutorials for complex permission delegation scenarios
- 🔧 **Developer Tools:** Specialized development tools for Advanced Permissions debugging
- 🌐 **Testnet Faucets:** More reliable testnet faucets for continuous development and testing

### 📋 **Detailed Feedback Areas**

#### **1. Advanced Permissions API & SDK**
- **Developer Experience:** 9/10 - Excellent documentation and examples
- **Implementation Difficulty:** 7/10 - Reasonable learning curve with good support
- **Feature Completeness:** 8/10 - Covers most use cases, room for advanced patterns
- **Documentation Quality:** 9/10 - Comprehensive and well-organized

#### **2. Envio Blockchain Indexing**
- **Setup Ease:** 9/10 - Quick setup with clear instructions
- **Performance:** 9/10 - Excellent real-time indexing capabilities
- **Developer Tools:** 7/10 - Good but could benefit from enhanced debugging
- **Documentation:** 8/10 - Clear but could use more advanced examples

#### **3. Hackathon Organization**
- **Communication:** 9/10 - Clear requirements and responsive support
- **Resources:** 8/10 - Good documentation and examples provided
- **Timeline:** 8/10 - Reasonable development timeframe
- **Track Structure:** 10/10 - Well-defined and motivating track categories

### 🎯 **Key Recommendations for Ecosystem Growth**

1. **📚 Enhanced Educational Content**
   - Advanced permission delegation tutorials
   - Complex multi-agent workflow examples
   - Security best practices guide

2. **🛠️ Improved Developer Tools**
   - Permission validation debugger
   - Gas estimation tools for delegated transactions
   - Integration testing framework

3. **🌐 Ecosystem Expansion**
   - More testnet support for development
   - Enhanced cross-chain permission capabilities
   - Better integration with existing DeFi protocols

4. **📊 Analytics & Monitoring**
   - Built-in performance monitoring
   - Usage analytics dashboard
   - Real-time permission status tracking

### 💬 **Community Engagement & Issues**

Throughout our development process, we've actively engaged with the community and provided feedback through multiple channels:

- **🔗 Social Media Engagement:** 30+ posts documenting development challenges and solutions
- **💡 Community Contributions:** Shared learnings and best practices with other developers  
- **🐛 Issue Reporting:** Identified and reported potential improvements during development
- **🤝 Peer Support:** Assisted other hackathon participants with integration challenges

*Note: Our feedback is based on extensive hands-on development experience integrating MetaMask Advanced Permissions into a production-ready DeFi automation platform over 3+ months of development.*

---

## �📖 Detailed Project Background

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

### 📋 AutoBalancerAgent Contract - Ethereum Sepolia Testnet

**📍 Contract Address**: [`0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815`](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815)

**🌐 Network**: Ethereum Testnet Sepolia (Chain ID: 11155111)

**🚀 Live Application**: https://autobalancer.lovable.app

### 📝 Deployment Details:
- **📍 Deployment Transaction**: [`0xbf42576501199b6966dc7d48fa4b28a18677311ef374f30ab57403fb894afbab`](https://sepolia.etherscan.io/tx/0xbf42576501199b6966dc7d48fa4b28a18677311ef374f30ab57403fb894afbab)
- **🏗️ Block Number**: 9,911,574
- **📊 Transaction Index**: 31
- **📅 Deployment Date**: December 25, 2025 11:52:37 UTC

### ✅ Contract Verification:
- **🔧 Compiler Version**: solc 0.8.31+commit.fd3a2265
- **⚙️ EVM Version**: default
- **🎯 Optimization**: Disabled
- **✅ Contract Source**: Verified (Exact Match)
- **📅 Verification Date**: December 25, 2025 17:22:37 (+05:30 UTC)

### 🔗 Etherscan Verification Links:
- **📊 [View Contract Overview](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815)**
- **💻 [Contract Source Code](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815#code)**
- **🔍 [Read Contract Functions](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815#readContract)**
- **✍️ [Write Contract Functions](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815#writeContract)**
- **📋 [Contract ABI](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815#code)**
- **📈 [Transaction History](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815#transactions)**
- **📊 [Internal Transactions](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAab70af9fF72F815#internaltx)**
- **🔄 [Events/Logs](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815#events)**

## 🏅 Hackathon Achievements

### 🎯 **Advanced Permissions Integration Highlights:**
- ✅ **EIP-7702 Implementation:** Full integration with MetaMask Advanced Permissions
- ✅ **Non-Custodial Automation:** Users maintain custody while enabling automation
- ✅ **A2A Permission Flow:** Agent-to-agent delegation with hierarchical permissions
- ✅ **Granular Control:** Time-based and amount-limited permissions
- ✅ **Revocable Security:** Users can revoke permissions at any time

### 📊 **Envio Integration Metrics:**
- ✅ **Real-time Indexing:** All contract events indexed within seconds
- ✅ **5 Event Types:** Complete coverage of automation events
- ✅ **GraphQL API:** Flexible querying for analytics and monitoring
- ✅ **Historical Data:** Full audit trail of all automated actions
- ✅ **Live Dashboard:** Real-time portfolio and execution tracking

### 🚀 **Technical Achievements:**
- ✅ **Smart Contract Verified:** Deployed and verified on Sepolia testnet
- ✅ **Full Stack Implementation:** Frontend, backend, and blockchain integration
- ✅ **Production Ready:** Comprehensive error handling and monitoring
- ✅ **Developer Friendly:** Well-documented APIs and clear code structure

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

## 🎬 Demo Video & Resources

### 📹 **Comprehensive Demo Video**

Watch our complete demo showcasing AutoBalancer Pro with MetaMask Advanced Permissions:

- 🎥 **[AutoBalancer Pro Hackathon Demo](https://youtu.be/sXqiT0W79AU?si=Ysp7BMK1Xw_RFTta)**

**Demo Highlights:**
- 🔐 MetaMask Advanced Permissions request and approval flow
- 💰 Setting up automated DCA with permission delegation
- 🔄 Portfolio rebalancing using delegated permissions
- 📊 Real-time monitoring via Envio-powered dashboard
- 🤝 Agent-to-agent permission delegation (A2A flow)

### 📊 **Presentation & Documentation**

- 📋 **[Project Presentation (PPT)](https://claude.ai/public/artifacts/54f34c15-190f-4b8b-8c24-007ea71ee702)** - Comprehensive slide deck
- 📝 **[Detailed Feedback Document](HACKATHON_FEEDBACK.md)** - Development experience and suggestions
- 🏗️ **[Architecture Documentation](README.md#-architecture-overview)** - System design and component overview

## 🔗 **Comprehensive Links Directory**

### 🌐 **Live Application & Demo**
- 🚀 **[AutoBalancer Pro - Live App](https://autobalancer.lovable.app)**
- 🎥 **[Hackathon Demo Video](https://youtu.be/sXqiT0W79AU?si=Ysp7BMK1Xw_RFTta)**
- 📋 **[Project Presentation](https://claude.ai/public/artifacts/54f34c15-190f-4b8b-8c24-007ea71ee702)**

### ⛓️ **Smart Contract & Blockchain**
- 📍 **Contract Address**: [`0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815`](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815)
- 🔍 **[Contract Source Code](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815#code)**
- ✅ **[Contract Verification](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815#code)**
- 🔄 **[Deployment Transaction](https://sepolia.etherscan.io/tx/0xbf42576501199b6966dc7d48fa4b28a18677311ef374f30ab57403fb894afbab)**
- 📊 **[Contract Events](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815#events)**
- 💻 **[Read Contract Functions](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815#readContract)**
- ✏️ **[Write Contract Functions](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815#writeContract)**

### 💻 **Code & Implementation**
- 🔐 **[Advanced Permissions Service](src/services/permissions.ts)** - EIP-7702 implementation
- 🤖 **[DCA Automation Engine](backend/src/services/dcaEngine.ts)** - Permission redemption logic
- 🔗 **[Agent Contract Interface](src/contracts/agentContract.ts)** - Smart contract integration
- ⚙️ **[Envio Configuration](explorer/config.yaml)** - Event indexing setup
- 📊 **[GraphQL Schema](envio-indexer/schema.graphql)** - Data structure definition
- 🎨 **[Frontend Components](src/components/)** - User interface implementation

### 📱 **Social Media & Community**
- 📅 **[Complete Development Journey](README.md#-x-twitter-presence)** - 30+ posts documenting progress
- 🐦 **[@Roan0i Twitter Profile](https://x.com/Roan0i)** - Follow for updates
- 👥 **[GitHub Repository](https://github.com/rohan911438)** - Source code and contributions
- 💬 **[Hackathon Feedback](HACKATHON_FEEDBACK.md)** - Detailed developer experience

### 📚 **Documentation & Resources**
- 📖 **[Setup Guide](README.md#-getting-started)** - Complete installation instructions
- 🏗️ **[Architecture Overview](README.md#-architecture-overview)** - System design
- 🔧 **[Configuration Guide](README.md#-configuration)** - Environment setup
- 🧪 **[Testing Instructions](README.md#testing)** - Integration testing
- 🛠️ **[Technology Stack](README.md#-technology-stack)** - Technical specifications

---

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

---

## 🏆 Hackathon Submission Summary

### **AutoBalancer Pro - MetaMask Advanced Permissions Integration**

#### **🎯 Tracks Applied For:**

1. **✅ Best Integration - Existing Project ($1,500)**
   - Integrated MetaMask Advanced Permissions into existing AutoBalancer platform
   - Non-custodial DeFi automation with EIP-7702 permissions
   - Full implementation of permission delegation and usage

2. **✅ Most Creative Use of Advanced Permissions ($1,500)**
   - Agent-to-Agent (A2A) permission delegation workflows
   - Hierarchical permission management for complex automation
   - Creative use case: 10 USDC/day → 5 USDC/day sub-delegation

3. **✅ Best Use of Envio ($1,500)**
   - Comprehensive event indexing for all automation activities
   - Real-time analytics and monitoring dashboard
   - Complete audit trail for transparency and compliance

4. **✅ Best Social Media Presence on X ($100)**
   - Active sharing of development journey
   - Tagged @MetaMaskDev in all relevant posts
   - Showcased Advanced Permissions benefits and user experience

5. **✅ Best Feedback ($100)**
   - Comprehensive feedback document: [`HACKATHON_FEEDBACK.md`](HACKATHON_FEEDBACK.md)
   - Detailed developer experience insights
   - Constructive suggestions for ecosystem improvement

#### **🔧 Technical Requirements Met:**

- ✅ **EIP-7702 Support:** Deployed on Sepolia testnet with Advanced Permissions
- ✅ **Smart Accounts Kit:** Full integration with MetaMask SDK
- ✅ **Working Demo:** Live application with Advanced Permissions in main flow
- ✅ **Envio Integration:** Complete indexing setup with real-time data
- ✅ **Contract Verification:** Fully verified on Etherscan with source code

#### **📊 Key Project Metrics:**

- **🏗️ Architecture:** 4-component system (Frontend, Backend, Blockchain, Indexer)
- **🔐 Smart Contract:** Verified deployment on Sepolia testnet
- **📈 Real-time Data:** 5 event types indexed via Envio
- **🎯 Automation:** DCA + Portfolio Rebalancing + Permission Delegation
- **💡 Innovation:** First DeFi platform with complete A2A permission flows
- **📱 Social Presence:** 30+ development journey posts over 3+ months
- **🌐 Live Demo:** Production-ready application with full functionality

#### **🔗 Quick Access Links:**

| Resource | Link |
|----------|------|
| **🚀 Live Application** | [autobalancer.lovable.app](https://autobalancer.lovable.app) |
| **🎥 Demo Video** | [YouTube Demo](https://youtu.be/sXqiT0W79AU?si=Ysp7BMK1Xw_RFTta) |
| **📋 Presentation** | [PPT Slides](https://claude.ai/public/artifacts/54f34c15-190f-4b8b-8c24-007ea71ee702) |
| **⛓️ Smart Contract** | [Etherscan](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815) |
| **💻 Source Code** | [GitHub](https://github.com/rohan911438) |
| **💬 Feedback** | [HACKATHON_FEEDBACK.md](HACKATHON_FEEDBACK.md) |
| **📱 Social Media** | [X/Twitter Thread](https://x.com/Roan0i) |

---

### **🎯 Final Submission Details**

**Team:** Brotherhood  
**Lead Developer:** Rohan Kumar  
**GitHub:** [rohan911438](https://github.com/rohan911438)  
**Contract Address:** [`0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815`](https://sepolia.etherscan.io/address/0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815)  
**Live Demo:** [autobalancer.lovable.app](https://autobalancer.lovable.app)  
**Submission Date:** January 2, 2026  

**🏅 Ready for Judging:** All tracks requirements met with comprehensive documentation, working demo, and extensive social media engagement.