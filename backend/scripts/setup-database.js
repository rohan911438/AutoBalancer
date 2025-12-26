#!/usr/bin/env node

/**
 * Backend Database Setup Script
 * Initializes SQLite database for AutoBalancer backend
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class DatabaseSetup {
  constructor() {
    this.rootDir = path.dirname(__dirname);
    this.dataDir = path.join(this.rootDir, 'data');
    this.dbPath = path.join(this.dataDir, 'autobalancer.db');
  }

  log(message, type = 'info') {
    const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
    console.log(`${icons[type]} ${message}`);
  }

  async ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      this.log(`Created data directory: ${this.dataDir}`);
    }
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);

      const tables = [
        // Users table for storing wallet addresses and preferences
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          wallet_address TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT 1,
          preferences JSON
        )`,

        // DCA Plans table
        `CREATE TABLE IF NOT EXISTS dca_plans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          wallet_address TEXT NOT NULL,
          from_token_address TEXT NOT NULL,
          to_token_address TEXT NOT NULL,
          amount_per_execution TEXT NOT NULL,
          frequency_hours INTEGER NOT NULL,
          total_executions INTEGER DEFAULT 0,
          max_executions INTEGER,
          is_active BOOLEAN DEFAULT 1,
          next_execution_time DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )`,

        // Rebalance Plans table
        `CREATE TABLE IF NOT EXISTS rebalance_plans (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          wallet_address TEXT NOT NULL,
          target_allocations JSON NOT NULL,
          rebalance_threshold REAL DEFAULT 5.0,
          is_active BOOLEAN DEFAULT 1,
          last_rebalance DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )`,

        // Delegations table for ERC-7715 permissions
        `CREATE TABLE IF NOT EXISTS delegations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          delegator_address TEXT NOT NULL,
          delegate_address TEXT NOT NULL,
          caveats JSON,
          authority TEXT,
          salt TEXT,
          signature TEXT,
          is_active BOOLEAN DEFAULT 1,
          expires_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,

        // Execution History table
        `CREATE TABLE IF NOT EXISTS execution_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          execution_type TEXT NOT NULL, -- 'dca', 'rebalance'
          plan_id INTEGER NOT NULL,
          wallet_address TEXT NOT NULL,
          transaction_hash TEXT,
          status TEXT NOT NULL, -- 'pending', 'completed', 'failed'
          gas_used INTEGER,
          gas_price TEXT,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          error_message TEXT,
          details JSON
        )`,

        // Token balances cache
        `CREATE TABLE IF NOT EXISTS token_balances (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          wallet_address TEXT NOT NULL,
          token_address TEXT NOT NULL,
          balance TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(wallet_address, token_address)
        )`,

        // System settings
        `CREATE TABLE IF NOT EXISTS system_settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          value TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      ];

      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address)',
        'CREATE INDEX IF NOT EXISTS idx_dca_plans_user ON dca_plans(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_dca_plans_active ON dca_plans(is_active, next_execution_time)',
        'CREATE INDEX IF NOT EXISTS idx_rebalance_plans_user ON rebalance_plans(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_delegations_delegator ON delegations(delegator_address)',
        'CREATE INDEX IF NOT EXISTS idx_delegations_active ON delegations(is_active, expires_at)',
        'CREATE INDEX IF NOT EXISTS idx_execution_history_plan ON execution_history(execution_type, plan_id)',
        'CREATE INDEX IF NOT EXISTS idx_token_balances_wallet ON token_balances(wallet_address)'
      ];

      let completed = 0;
      const total = tables.length + indexes.length;

      // Create tables
      tables.forEach((sql, index) => {
        db.run(sql, (err) => {
          if (err) {
            this.log(`Error creating table ${index + 1}: ${err.message}`, 'error');
            reject(err);
            return;
          }
          
          completed++;
          if (completed === total) {
            db.close();
            this.log('All database tables and indexes created successfully', 'success');
            resolve();
          }
        });
      });

      // Create indexes
      indexes.forEach((sql, index) => {
        db.run(sql, (err) => {
          if (err) {
            this.log(`Error creating index ${index + 1}: ${err.message}`, 'error');
            reject(err);
            return;
          }
          
          completed++;
          if (completed === total) {
            db.close();
            this.log('All database tables and indexes created successfully', 'success');
            resolve();
          }
        });
      });
    });
  }

  async insertInitialData() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);

      const initialSettings = [
        { key: 'scheduler_interval_minutes', value: '1' },
        { key: 'default_rebalance_threshold', value: '5.0' },
        { key: 'max_gas_price_gwei', value: '50' },
        { key: 'slippage_tolerance', value: '0.5' },
        { key: 'database_version', value: '1.0.0' }
      ];

      const stmt = db.prepare('INSERT OR IGNORE INTO system_settings (key, value) VALUES (?, ?)');

      let completed = 0;
      initialSettings.forEach(setting => {
        stmt.run([setting.key, setting.value], (err) => {
          if (err) {
            this.log(`Error inserting setting ${setting.key}: ${err.message}`, 'error');
            reject(err);
            return;
          }
          
          completed++;
          if (completed === initialSettings.length) {
            stmt.finalize();
            db.close();
            this.log('Initial system settings inserted', 'success');
            resolve();
          }
        });
      });
    });
  }

  async run() {
    console.log('🗄️  AutoBalancer Database Setup');
    console.log('===============================\n');

    try {
      // Ensure data directory exists
      await this.ensureDataDirectory();

      // Check if database already exists
      if (fs.existsSync(this.dbPath)) {
        this.log('Database already exists, updating schema...', 'warning');
      } else {
        this.log('Creating new database...', 'info');
      }

      // Create tables and indexes
      await this.createTables();

      // Insert initial data
      await this.insertInitialData();

      this.log('\n✅ Database setup completed successfully!', 'success');
      this.log(`Database location: ${this.dbPath}`, 'info');
      this.log('\n📋 Next steps:', 'info');
      this.log('1. Start the backend: npm run dev', 'info');
      this.log('2. Check the health endpoint: http://localhost:3001/health', 'info');

    } catch (error) {
      this.log(`Database setup failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the database setup
const setup = new DatabaseSetup();
setup.run().catch(error => {
  console.error('❌ Database setup failed:', error);
  process.exit(1);
});