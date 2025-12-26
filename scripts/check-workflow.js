#!/usr/bin/env node

/**
 * AutoBalancer Workflow Checker
 * Validates that all components are properly configured and ready to run
 */

const fs = require('fs');
const path = require('path');

class WorkflowChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
    this.rootDir = process.cwd();
  }

  log(type, message) {
    const timestamp = new Date().toISOString().slice(11, 19);
    const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
    console.log(`${timestamp} ${icon} ${message}`);
    this[type === 'error' ? 'errors' : type === 'warning' ? 'warnings' : 'success'].push(message);
  }

  checkFile(filePath, description, isRequired = true) {
    const fullPath = path.join(this.rootDir, filePath);
    if (fs.existsSync(fullPath)) {
      this.log('success', `${description} exists: ${filePath}`);
      return true;
    } else {
      this.log(isRequired ? 'error' : 'warning', `${description} missing: ${filePath}`);
      return false;
    }
  }

  checkDirectory(dirPath, description, isRequired = true) {
    const fullPath = path.join(this.rootDir, dirPath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
      this.log('success', `${description} directory exists: ${dirPath}`);
      return true;
    } else {
      this.log(isRequired ? 'error' : 'warning', `${description} directory missing: ${dirPath}`);
      return false;
    }
  }

  checkPackageJson(packagePath, requiredScripts = []) {
    const fullPath = path.join(this.rootDir, packagePath);
    if (!this.checkFile(packagePath, `Package.json for ${path.dirname(packagePath) || 'root'}`)) {
      return false;
    }

    try {
      const packageContent = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      
      // Check scripts
      const scripts = packageContent.scripts || {};
      for (const script of requiredScripts) {
        if (scripts[script]) {
          this.log('success', `Script '${script}' found in ${packagePath}`);
        } else {
          this.log('warning', `Script '${script}' missing in ${packagePath}`);
        }
      }

      return true;
    } catch (error) {
      this.log('error', `Invalid JSON in ${packagePath}: ${error.message}`);
      return false;
    }
  }

  checkEnvironmentTemplate() {
    const envExample = path.join(this.rootDir, '.env.example');
    if (!this.checkFile('.env.example', 'Environment template')) {
      return false;
    }

    try {
      const envContent = fs.readFileSync(envExample, 'utf8');
      const requiredVars = [
        'VITE_CONTRACT_ADDRESS',
        'VITE_CHAIN_ID', 
        'VITE_API_BASE_URL',
        'ETHEREUM_RPC_URL',
        'BACKEND_PORT'
      ];

      for (const envVar of requiredVars) {
        if (envContent.includes(envVar)) {
          this.log('success', `Environment variable ${envVar} configured in template`);
        } else {
          this.log('warning', `Environment variable ${envVar} missing from template`);
        }
      }
      return true;
    } catch (error) {
      this.log('error', `Error reading .env.example: ${error.message}`);
      return false;
    }
  }

  checkFrontendComponents() {
    console.log('\n🎨 Checking Frontend Components...');
    
    // Check main frontend files
    this.checkFile('src/main.tsx', 'Frontend entry point');
    this.checkFile('src/App.tsx', 'Main App component');
    this.checkFile('index.html', 'HTML template');
    this.checkFile('vite.config.ts', 'Vite configuration');
    
    // Check key frontend directories
    this.checkDirectory('src/components', 'Components directory');
    this.checkDirectory('src/pages', 'Pages directory');
    this.checkDirectory('src/contexts', 'Contexts directory');
    
    // Check package.json
    this.checkPackageJson('package.json', ['dev:frontend', 'build:frontend']);
  }

  checkBackendComponents() {
    console.log('\n🔧 Checking Backend Components...');
    
    // Check backend files
    this.checkFile('backend/package.json', 'Backend package.json');
    this.checkFile('backend/src/index.ts', 'Backend entry point');
    this.checkFile('backend/src/server.ts', 'Backend server');
    
    // Check backend directories
    this.checkDirectory('backend/src/api', 'API routes directory');
    this.checkDirectory('backend/src/services', 'Services directory');
    this.checkDirectory('backend/src/contracts', 'Contract interfaces directory');
    
    // Check backend package.json
    this.checkPackageJson('backend/package.json', ['dev', 'build', 'start']);
  }

  checkIndexerComponents() {
    console.log('\n📊 Checking Envio Indexer Components...');
    
    // Check indexer files
    this.checkFile('explorer/config.yaml', 'Envio configuration');
    this.checkFile('explorer/schema.graphql', 'GraphQL schema');
    this.checkFile('explorer/package.json', 'Indexer package.json');
    this.checkFile('explorer/src/EventHandlers.ts', 'Event handlers');
    
    // Check generated directory
    this.checkDirectory('explorer/generated', 'Generated types directory');
    
    // Check indexer package.json
    this.checkPackageJson('explorer/package.json', ['dev', 'start']);
  }

  checkContractsAndABI() {
    console.log('\n📋 Checking Smart Contract Integration...');
    
    // Check contract files
    this.checkFile('contracts/AutoBalancerAgent.sol', 'Smart contract source');
    this.checkFile('explorer/abis/AutoBalancerAgent.json', 'Contract ABI for indexer');
    
    // Check contract integration in frontend
    this.checkFile('src/contracts/agentContract.ts', 'Frontend contract interface');
  }

  checkWorkflowScripts() {
    console.log('\n⚙️ Checking Workflow Scripts...');
    
    // Check if workflow scripts exist in main package.json
    const mainPackage = path.join(this.rootDir, 'package.json');
    if (fs.existsSync(mainPackage)) {
      const packageContent = JSON.parse(fs.readFileSync(mainPackage, 'utf8'));
      const scripts = packageContent.scripts || {};
      
      const workflowScripts = ['dev', 'setup', 'workflow:check', 'workflow:start'];
      for (const script of workflowScripts) {
        if (scripts[script]) {
          this.log('success', `Workflow script '${script}' available`);
        } else {
          this.log('warning', `Workflow script '${script}' missing`);
        }
      }
    }
  }

  async run() {
    console.log('🚀 AutoBalancer Workflow Checker');
    console.log('=====================================\n');

    // Check environment configuration
    console.log('🔧 Checking Environment Configuration...');
    this.checkEnvironmentTemplate();

    // Check all components
    this.checkFrontendComponents();
    this.checkBackendComponents();
    this.checkIndexerComponents();
    this.checkContractsAndABI();
    this.checkWorkflowScripts();

    // Summary
    console.log('\n📊 Workflow Check Summary');
    console.log('==========================');
    console.log(`✅ Successful checks: ${this.success.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Errors: ${this.errors.length}`);

    if (this.errors.length === 0) {
      console.log('\n🎉 All critical components are properly configured!');
      console.log('💡 Run "npm run setup" to initialize dependencies');
      console.log('🚀 Run "npm run dev" to start all components');
    } else {
      console.log('\n❗ Please fix the errors above before proceeding');
      console.log('💡 Check the README.md for setup instructions');
    }

    if (this.warnings.length > 0) {
      console.log('\n📝 Note: Warnings indicate optional components that could improve functionality');
    }

    return this.errors.length === 0;
  }
}

// Run the checker
const checker = new WorkflowChecker();
checker.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Workflow check failed:', error);
  process.exit(1);
});