#!/usr/bin/env node

/**
 * AutoBalancer Workflow Stopper
 * Gracefully stops all running components
 */

const { exec } = require('child_process');
const process = require('process');

class WorkflowStopper {
  constructor() {
    this.ports = [3001, 5173, 8080, 5432]; // Backend, Frontend, Hasura, PostgreSQL
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().slice(11, 19);
    const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', stop: '🛑' };
    console.log(`[${timestamp}] ${icons[type]} ${message}`);
  }

  async killProcessOnPort(port) {
    return new Promise((resolve) => {
      let command;
      
      if (process.platform === 'win32') {
        // Windows
        command = `netstat -ano | findstr :${port}`;
      } else {
        // Unix-like systems
        command = `lsof -ti:${port}`;
      }

      exec(command, (error, stdout, stderr) => {
        if (error || !stdout.trim()) {
          this.log(`No process found on port ${port}`, 'info');
          resolve();
          return;
        }

        let killCommand;
        if (process.platform === 'win32') {
          // Parse Windows netstat output and extract PID
          const lines = stdout.split('\n');
          const pids = [];
          for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 5 && parts[1].includes(`:${port}`)) {
              const pid = parts[4];
              if (pid && !isNaN(pid)) {
                pids.push(pid);
              }
            }
          }
          
          if (pids.length === 0) {
            this.log(`No PID found for port ${port}`, 'info');
            resolve();
            return;
          }

          killCommand = `taskkill /PID ${pids.join(' /PID ')} /F`;
        } else {
          // Unix-like systems
          const pids = stdout.trim().split('\n').filter(pid => pid && !isNaN(pid));
          if (pids.length === 0) {
            this.log(`No PID found for port ${port}`, 'info');
            resolve();
            return;
          }
          killCommand = `kill -9 ${pids.join(' ')}`;
        }

        exec(killCommand, (killError) => {
          if (killError) {
            this.log(`Failed to kill process on port ${port}: ${killError.message}`, 'error');
          } else {
            this.log(`Stopped process on port ${port}`, 'success');
          }
          resolve();
        });
      });
    });
  }

  async stopNpmProcesses() {
    return new Promise((resolve) => {
      let command;
      
      if (process.platform === 'win32') {
        // Windows - find npm/node processes
        command = 'tasklist /FI "IMAGENAME eq node.exe" /FO CSV | findstr -i "autobalancer\\|vite\\|envio"';
      } else {
        // Unix-like systems
        command = 'ps aux | grep -E "(autobalancer|vite|envio)" | grep -v grep';
      }

      exec(command, (error, stdout, stderr) => {
        if (error || !stdout.trim()) {
          this.log('No AutoBalancer processes found', 'info');
          resolve();
          return;
        }

        // Parse and kill processes
        const lines = stdout.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (process.platform === 'win32') {
            // Windows CSV format
            const match = line.match(/"([^"]*)",/);
            if (match && match[1]) {
              exec(`taskkill /IM "${match[1]}" /F`, () => {});
            }
          } else {
            // Unix-like systems
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 2) {
              const pid = parts[1];
              exec(`kill -9 ${pid}`, () => {});
            }
          }
        }

        this.log('Stopped AutoBalancer npm processes', 'success');
        resolve();
      });
    });
  }

  async stopDockerContainers() {
    return new Promise((resolve) => {
      exec('docker ps --format "table {{.Names}}"', (error, stdout, stderr) => {
        if (error) {
          this.log('Docker not available or no containers running', 'info');
          resolve();
          return;
        }

        const containers = stdout
          .split('\n')
          .filter(line => line.includes('autobalancer') || line.includes('envio') || line.includes('postgres'))
          .filter(line => !line.includes('NAMES')); // Remove header

        if (containers.length === 0) {
          this.log('No AutoBalancer Docker containers found', 'info');
          resolve();
          return;
        }

        const containerNames = containers.join(' ');
        exec(`docker stop ${containerNames}`, (stopError) => {
          if (stopError) {
            this.log(`Failed to stop Docker containers: ${stopError.message}`, 'error');
          } else {
            this.log('Stopped AutoBalancer Docker containers', 'success');
          }
          resolve();
        });
      });
    });
  }

  async run() {
    console.log('🛑 AutoBalancer Workflow Stopper');
    console.log('================================\n');

    try {
      this.log('Stopping AutoBalancer workflow...', 'stop');

      // Stop npm processes first
      await this.stopNpmProcesses();

      // Stop processes on known ports
      for (const port of this.ports) {
        await this.killProcessOnPort(port);
      }

      // Stop Docker containers
      await this.stopDockerContainers();

      // Final cleanup - kill any remaining node processes related to AutoBalancer
      await new Promise((resolve) => {
        setTimeout(() => {
          this.log('Performing final cleanup...', 'info');
          
          if (process.platform === 'win32') {
            exec('taskkill /F /IM node.exe /FI "WINDOWTITLE eq AutoBalancer*"', () => resolve());
          } else {
            exec('pkill -f "autobalancer\\|vite\\|envio"', () => resolve());
          }
        }, 1000);
      });

      this.log('AutoBalancer workflow stopped successfully!', 'success');
      this.log('All components have been terminated.', 'info');

    } catch (error) {
      this.log(`Error during shutdown: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the workflow stopper
const stopper = new WorkflowStopper();
stopper.run().catch(error => {
  console.error('❌ Workflow stop failed:', error);
  process.exit(1);
});