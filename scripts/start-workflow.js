#!/usr/bin/env node

/**
 * AutoBalancer Workflow Starter
 * Orchestrates the startup of all components in the correct order
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class WorkflowStarter {
  constructor() {
    this.rootDir = process.cwd();
    this.processes = new Map();
    this.startupOrder = [
      {
        name: 'backend',
        command: 'npm',
        args: ['run', 'dev:backend'],
        cwd: this.rootDir,
        waitTime: 3000, // Wait 3 seconds before starting next
        healthCheck: 'http://localhost:3001/health'
      },
      {
        name: 'indexer',
        command: 'npm',
        args: ['run', 'dev:indexer'],
        cwd: this.rootDir,
        waitTime: 5000, // Wait 5 seconds for database setup
        healthCheck: null
      },
      {
        name: 'frontend',
        command: 'npm',
        args: ['run', 'dev:frontend'],
        cwd: this.rootDir,
        waitTime: 2000,
        healthCheck: 'http://localhost:5173'
      }
    ];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().slice(11, 19);
    const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', start: '🚀' };
    console.log(`[${timestamp}] ${icons[type]} ${message}`);
  }

  async checkPrerequisites() {
    this.log('Checking prerequisites...', 'info');

    // Check if .env files exist
    const envFiles = ['.env', 'backend/.env', 'explorer/.env'];
    for (const envFile of envFiles) {
      const envPath = path.join(this.rootDir, envFile);
      if (!fs.existsSync(envPath)) {
        this.log(`Environment file missing: ${envFile}`, 'error');
        this.log('Run "npm run setup:env" first', 'info');
        return false;
      }
    }

    // Check if node_modules exist
    const nodeModulesPaths = [
      'node_modules',
      'backend/node_modules',
      'explorer/node_modules'
    ];

    for (const modulePath of nodeModulesPaths) {
      const fullPath = path.join(this.rootDir, modulePath);
      if (!fs.existsSync(fullPath)) {
        this.log(`Dependencies missing: ${modulePath}`, 'error');
        this.log('Run "npm run setup:deps" first', 'info');
        return false;
      }
    }

    this.log('Prerequisites check passed', 'success');
    return true;
  }

  async startProcess(config) {
    return new Promise((resolve, reject) => {
      this.log(`Starting ${config.name}...`, 'start');

      const process = spawn(config.command, config.args, {
        cwd: config.cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: process.platform === 'win32'
      });

      process.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log(`[${config.name}] ${output}`);
        }
      });

      process.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output && !output.includes('warning')) { // Filter out npm warnings
          console.error(`[${config.name}] ${output}`);
        }
      });

      process.on('error', (error) => {
        this.log(`Failed to start ${config.name}: ${error.message}`, 'error');
        reject(error);
      });

      process.on('exit', (code) => {
        if (code !== 0) {
          this.log(`${config.name} exited with code ${code}`, 'error');
        } else {
          this.log(`${config.name} stopped`, 'info');
        }
        this.processes.delete(config.name);
      });

      this.processes.set(config.name, process);

      // Give process time to start
      setTimeout(() => {
        this.log(`${config.name} started successfully`, 'success');
        resolve(process);
      }, config.waitTime);
    });
  }

  async startAll() {
    this.log('Starting AutoBalancer workflow...', 'start');

    for (const config of this.startupOrder) {
      try {
        await this.startProcess(config);
        
        if (config.waitTime > 0) {
          this.log(`Waiting ${config.waitTime/1000}s before starting next component...`, 'info');
          await new Promise(resolve => setTimeout(resolve, config.waitTime));
        }
      } catch (error) {
        this.log(`Failed to start ${config.name}`, 'error');
        throw error;
      }
    }

    this.log('All components started successfully!', 'success');
    this.printAccessInfo();
  }

  printAccessInfo() {
    console.log('\n🌐 Access URLs:');
    console.log('==============');
    console.log('Frontend:     http://localhost:5173');
    console.log('Backend API:  http://localhost:3001');
    console.log('Hasura:       http://localhost:8080 (when indexer is running)');
    console.log('\n📊 Monitoring:');
    console.log('==============');
    console.log('Backend logs: Check console output for [backend] prefix');
    console.log('Indexer logs: Check console output for [indexer] prefix');
    console.log('Frontend:     Check console output for [frontend] prefix');
    console.log('\n🛑 To stop all services: Ctrl+C or npm run workflow:stop');
  }

  async stop() {
    this.log('Stopping all processes...', 'info');
    
    for (const [name, process] of this.processes) {
      this.log(`Stopping ${name}...`, 'info');
      process.kill('SIGTERM');
      
      // Force kill after 5 seconds if not stopped
      setTimeout(() => {
        if (!process.killed) {
          process.kill('SIGKILL');
          this.log(`Force stopped ${name}`, 'warning');
        }
      }, 5000);
    }

    this.log('All processes stopped', 'success');
  }

  async run() {
    console.log('🚀 AutoBalancer Workflow Starter');
    console.log('=================================\n');

    try {
      // Check prerequisites
      const prereqsOk = await this.checkPrerequisites();
      if (!prereqsOk) {
        process.exit(1);
      }

      // Start all components
      await this.startAll();

      // Handle shutdown
      process.on('SIGINT', () => {
        console.log('\n\n🛑 Received shutdown signal...');
        this.stop().then(() => {
          process.exit(0);
        });
      });

      process.on('SIGTERM', () => {
        this.stop().then(() => {
          process.exit(0);
        });
      });

      // Keep the main process alive
      process.stdin.resume();

    } catch (error) {
      this.log(`Workflow startup failed: ${error.message}`, 'error');
      await this.stop();
      process.exit(1);
    }
  }
}

// Run the workflow starter
const starter = new WorkflowStarter();
starter.run().catch(error => {
  console.error('❌ Workflow startup failed:', error);
  process.exit(1);
});