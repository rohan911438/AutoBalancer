#!/usr/bin/env node

/**
 * AutoBalancer Environment Setup Script
 * Initializes environment files and validates configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class EnvironmentSetup {
  constructor() {
    this.rootDir = process.cwd();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  log(message, type = 'info') {
    const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
    console.log(`${icons[type]} ${message}`);
  }

  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async copyEnvExample() {
    const envExamplePath = path.join(this.rootDir, '.env.example');
    const envPath = path.join(this.rootDir, '.env');

    if (!fs.existsSync(envExamplePath)) {
      this.log('Environment template (.env.example) not found!', 'error');
      return false;
    }

    if (fs.existsSync(envPath)) {
      const overwrite = await this.askQuestion('🔧 .env file already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        this.log('Skipping .env creation', 'info');
        return true;
      }
    }

    try {
      fs.copyFileSync(envExamplePath, envPath);
      this.log('Created .env file from template', 'success');
      return true;
    } catch (error) {
      this.log(`Failed to create .env file: ${error.message}`, 'error');
      return false;
    }
  }

  async setupBackendEnv() {
    const backendEnvExample = path.join(this.rootDir, 'backend', '.env.example');
    const backendEnv = path.join(this.rootDir, 'backend', '.env');

    // Create backend .env.example if it doesn't exist
    if (!fs.existsSync(backendEnvExample)) {
      const backendEnvContent = `# AutoBalancer Backend Configuration

# Server Configuration
NODE_ENV=development
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Blockchain Configuration
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
AUTOBALANCER_CONTRACT_ADDRESS=0xC3623b0ce1b7976b7d6F8aebdAb70af9fF72F815
SEPOLIA_CHAIN_ID=11155111

# Private key for backend operations (TEST ACCOUNT ONLY!)
PRIVATE_KEY=your_test_private_key_here

# Database
DATABASE_URL=sqlite:./data/autobalancer.db

# Automation Settings
SCHEDULER_INTERVAL_MINUTES=1
REBALANCE_THRESHOLD_PERCENT=5
ENABLE_AUTOMATED_REBALANCING=true

# Logging
LOG_LEVEL=info
ENABLE_LOGGING=true
`;
      
      // Ensure backend directory exists
      const backendDir = path.join(this.rootDir, 'backend');
      if (!fs.existsSync(backendDir)) {
        fs.mkdirSync(backendDir, { recursive: true });
      }
      
      fs.writeFileSync(backendEnvExample, backendEnvContent);
      this.log('Created backend/.env.example', 'success');
    }

    // Copy to .env if doesn't exist
    if (!fs.existsSync(backendEnv)) {
      fs.copyFileSync(backendEnvExample, backendEnv);
      this.log('Created backend/.env file', 'success');
    } else {
      this.log('backend/.env already exists', 'info');
    }

    return true;
  }

  async setupExplorerEnv() {
    const explorerEnvExample = path.join(this.rootDir, 'explorer', '.env.example');
    const explorerEnv = path.join(this.rootDir, 'explorer', '.env');

    // Create explorer .env.example if it doesn't exist
    if (!fs.existsSync(explorerEnvExample)) {
      const explorerEnvContent = `# Envio Indexer Configuration

# PostgreSQL Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=testing
POSTGRES_DB=envio-dev

# Hasura GraphQL
HASURA_GRAPHQL_ENDPOINT=http://localhost:8080/v1/graphql
HASURA_GRAPHQL_ADMIN_SECRET=testing
HASURA_GRAPHQL_UNAUTHORIZED_ROLE=public

# Envio RPC
ENVIO_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Development
DEBUG=true
`;
      
      // Ensure explorer directory exists
      const explorerDir = path.join(this.rootDir, 'explorer');
      if (!fs.existsSync(explorerDir)) {
        fs.mkdirSync(explorerDir, { recursive: true });
      }
      
      fs.writeFileSync(explorerEnvExample, explorerEnvContent);
      this.log('Created explorer/.env.example', 'success');
    }

    // Copy to .env if doesn't exist
    if (!fs.existsSync(explorerEnv)) {
      fs.copyFileSync(explorerEnvExample, explorerEnv);
      this.log('Created explorer/.env file', 'success');
    } else {
      this.log('explorer/.env already exists', 'info');
    }

    return true;
  }

  async promptForConfiguration() {
    this.log('\n🔧 Let\'s configure your environment variables!', 'info');
    this.log('You can update these later in the .env files\n', 'info');

    const config = {};

    // Ask for RPC URL
    const rpcUrl = await this.askQuestion('🌐 Enter your Sepolia RPC URL (Alchemy/Infura): ');
    if (rpcUrl && rpcUrl.startsWith('http')) {
      config.ETHEREUM_RPC_URL = rpcUrl;
      config.VITE_SEPOLIA_RPC_URL = rpcUrl;
      config.ENVIO_RPC_URL = rpcUrl;
    }

    // Ask for private key (optional)
    const privateKey = await this.askQuestion('🔐 Enter test private key for backend automation (optional): ');
    if (privateKey && privateKey.startsWith('0x')) {
      config.PRIVATE_KEY = privateKey;
    }

    return config;
  }

  async updateEnvFiles(config) {
    const envFiles = [
      path.join(this.rootDir, '.env'),
      path.join(this.rootDir, 'backend', '.env'),
      path.join(this.rootDir, 'explorer', '.env')
    ];

    for (const envFile of envFiles) {
      if (fs.existsSync(envFile)) {
        try {
          let content = fs.readFileSync(envFile, 'utf8');
          
          // Update each config value
          for (const [key, value] of Object.entries(config)) {
            if (value) {
              // Replace the placeholder or add the line
              const regex = new RegExp(`^${key}=.*$`, 'm');
              if (content.match(regex)) {
                content = content.replace(regex, `${key}=${value}`);
              } else {
                content += `\n${key}=${value}`;
              }
            }
          }
          
          fs.writeFileSync(envFile, content);
          this.log(`Updated ${envFile}`, 'success');
        } catch (error) {
          this.log(`Failed to update ${envFile}: ${error.message}`, 'error');
        }
      }
    }
  }

  async createDataDirectories() {
    const directories = [
      path.join(this.rootDir, 'backend', 'data'),
      path.join(this.rootDir, 'backend', 'logs'),
      path.join(this.rootDir, 'explorer', 'generated')
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        this.log(`Created directory: ${path.relative(this.rootDir, dir)}`, 'success');
      }
    }
  }

  async run() {
    console.log('🚀 AutoBalancer Environment Setup');
    console.log('===================================\n');

    try {
      // Create environment files
      await this.copyEnvExample();
      await this.setupBackendEnv();
      await this.setupExplorerEnv();

      // Create necessary directories
      await this.createDataDirectories();

      // Interactive configuration
      const configure = await this.askQuestion('🛠️  Configure environment variables interactively? (y/N): ');
      
      if (configure.toLowerCase() === 'y') {
        const config = await this.promptForConfiguration();
        await this.updateEnvFiles(config);
      }

      this.log('\n✅ Environment setup complete!', 'success');
      this.log('\n📋 Next steps:', 'info');
      this.log('1. Edit .env files with your actual values', 'info');
      this.log('2. Run "npm run setup:deps" to install dependencies', 'info');
      this.log('3. Run "npm run workflow:check" to validate setup', 'info');
      this.log('4. Run "npm run dev" to start development', 'info');

    } catch (error) {
      this.log(`Setup failed: ${error.message}`, 'error');
    } finally {
      this.rl.close();
    }
  }
}

// Run the setup
const setup = new EnvironmentSetup();
setup.run().catch(error => {
  console.error('❌ Environment setup failed:', error);
  process.exit(1);
});