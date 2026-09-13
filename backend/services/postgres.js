const { Pool } = require('pg');

class PostgresClient {
  constructor() {
    this.pool = null;
  }

  async connect() {
    return new Promise((resolve) => {
      try {
        this.pool = new Pool({
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          database: process.env.DB_NAME || 'cybernet_lab',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        });
        this.pool.on('error', () => {});
        console.log('PostgreSQL pool created');
        resolve(true);
      } catch (e) {
        console.warn('PostgreSQL unavailable, running without database persistence.');
        this.pool = null;
        resolve(false);
      }
    });
  }

  isAvailable() {
    return !!this.pool;
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async initializeSchema() {
    if (!this.pool) {
      console.warn('PostgreSQL not available, skipping schema initialization.');
      return false;
    }
    const schema = `
      CREATE TABLE IF NOT EXISTS labs (
        id SERIAL PRIMARY KEY,
        lab_id VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        category VARCHAR(100),
        level VARCHAR(20),
        config JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS lab_sessions (
        id SERIAL PRIMARY KEY,
        lab_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(100),
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active',
        metadata JSONB
      );
      
      CREATE TABLE IF NOT EXISTS lab_steps (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES lab_sessions(id),
        step_id VARCHAR(50) NOT NULL,
        instruction TEXT,
        verification_type VARCHAR(20),
        expected TEXT,
        user_input TEXT,
        passed BOOLEAN,
        hints_used INTEGER DEFAULT 0,
        completed_at TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS telemetry (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        cpu_usage FLOAT,
        memory_usage FLOAT,
        temperature FLOAT,
        interface_stats JSONB,
        routing_table JSONB
      );
      
      CREATE TABLE IF NOT EXISTS error_injections (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES lab_sessions(id),
        lab_id VARCHAR(50),
        error_type VARCHAR(100),
        injected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        metadata JSONB
      );
      
      CREATE INDEX IF NOT EXISTS idx_labs_lab_id ON labs(lab_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_lab_id ON lab_sessions(lab_id);
      CREATE INDEX IF NOT EXISTS idx_telemetry_device ON telemetry(device_id);
    `;
    
    try {
      await this.pool.query(schema);
      console.log('PostgreSQL schema initialized');
      return true;
    } catch (err) {
      console.warn('Schema initialization error:', err.message);
      return false;
    }
  }

async query(text, params) {
     if (!this.pool) {
       throw new Error('PostgreSQL not connected');
     }
     const start = Date.now();
     const res = await this.pool.query(text, params);
     const duration = Date.now() - start;
     if (duration > 1000) {
       console.warn('Slow query:', { text, duration, rows: res.rowCount });
     }
     return res;
   }
}

module.exports = { PostgresClient };
