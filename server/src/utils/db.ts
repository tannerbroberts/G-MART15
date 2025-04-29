/**
 * Database Utilities Module
 * ------------------------------------------------------------------------------
 * This module provides database connection functionality for both development
 * and production environments. It manages PostgreSQL connections through:
 * 
 * 1. Direct pg client/pool for raw SQL queries
 * 2. Knex.js for query building and migrations
 * 
 * Connection Configuration:
 * - Production (Heroku): Uses DATABASE_URL with SSL settings
 * - Development: Uses individual environment variables or defaults
 * 
 * Environment Variables:
 * - DATABASE_URL: Full connection string (used in production)
 * - DB_HOST: Database host (default: localhost)
 * - DB_PORT: Database port (default: 5432)
 * - DB_USER: Database user (default: postgres)
 * - DB_PASSWORD: Database password
 * - DB_DATABASE: Database name (default: blackjack)
 */

// Import necessary modules
import pg from 'pg';
import Knex from 'knex';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

/**
 * Load environment variables with robust error handling
 * Tries multiple locations for the .env file
 */
try {
  // Try to load from server directory's parent (project root)
  const envPath = path.resolve(__dirname, '../../../.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('✅ Loaded .env file from:', envPath);
  } else {
    // Fallback to standard locations
    console.log('ℹ️ No .env file found at', envPath, 'using environment variables only');
    dotenv.config(); // Try default location as fallback
  }
} catch (err) {
  console.warn('⚠️ Error loading .env file, falling back to environment variables:', err);
}

/**
 * Get database configuration based on environment
 * @returns PostgreSQL connection configuration object
 */
const getConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`🔧 Database environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  
  // For Heroku, use DATABASE_URL (automatically set by Heroku PostgreSQL addon)
  if (process.env.DATABASE_URL) {
    console.log('ℹ️ Using DATABASE_URL from environment');
    const config = { 
      connectionString: process.env.DATABASE_URL,
      // SSL settings required for Heroku Postgres
      ssl: { 
        rejectUnauthorized: false 
      }
    };
    
    // Log partial connection string for debugging (hiding credentials)
    const urlParts = process.env.DATABASE_URL.split('@');
    if (urlParts.length > 1) {
      console.log(`🔌 Connection to: ${urlParts[1].split('/')[0]}`);
    }
    
    return config;
  } else {
    // For local development, use individual environment variables
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || 'blackjack',
    };
    console.log(`🔌 Using local database: ${config.host}:${config.port}/${config.database}`);
    return config;
  }
};

/**
 * Create a one-time PostgreSQL client for testing connections
 * @returns PostgreSQL Client instance
 */
const createTestClient = () => {
  return new pg.Client(getConfig());
};

/**
 * Create a PostgreSQL connection pool for handling multiple connections
 * @returns PostgreSQL Pool instance
 */
const createPool = () => {
  const { Pool } = pg;
  return new Pool({
    ...getConfig(),
    // Connection pool settings
    max: 20,                // Maximum connections in the pool
    idleTimeoutMillis: 30000,  // Connection timeout when idle
    connectionTimeoutMillis: 5000 // Connection acquisition timeout
  });
};

/**
 * Create a configured Knex.js instance for query building and migrations
 * @returns Knex instance
 */
const createKnex = () => {
  return Knex({
    client: 'pg',
    connection: getConfig(),
    // Pool configuration optimized for Heroku
    pool: { 
      min: 2,       // Minimum connections
      max: 10,      // Maximum connections
      idleTimeoutMillis: 30000,  // How long to hold idle connections
      acquireTimeoutMillis: 10000 // How long to wait for a connection
    },
    // Migration settings
    migrations: {
      directory: path.join(__dirname, '../../migrations')
    },
    // Debug SQL in development
    debug: process.env.NODE_ENV !== 'production'
  });
};

// Create and export the database instances
const pool = createPool();
const db = createKnex();

/**
 * Utility for running raw SQL queries with the connection pool
 * @param text SQL query text
 * @param params SQL query parameters
 * @returns Query result promise
 */
const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

/**
 * Initialize the database connection and run any pending migrations
 * This function is called during server startup
 * 
 * @returns Promise that resolves when database is initialized
 * @throws Error if database connection fails
 */
const initDb = async (): Promise<void> => {
  // Use a separate client for testing, not the pool
  const client = createTestClient();
  console.log('🔄 Testing database connection...');
  
  try {
    // First, test the connection
    await client.connect();
    console.log('✅ Database connection successful');
    
    // Get database information for logging
    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log(`📊 Connected to database: ${result.rows[0].current_database}`);
    console.log(`📊 PostgreSQL version: ${result.rows[0].version.split(' ')[1]}`);
    console.log(`📊 Database user: ${result.rows[0].current_user}`);
    
    // Close the test client
    await client.end();
    
    // Run migrations (only if database connection is successful)
    try {
      console.log('🔄 Running database migrations...');
      const migrationResult = await db.migrate.latest();
      
      if (migrationResult[1].length === 0) {
        console.log('✅ Database schema is up to date, no migrations needed');
      } else {
        console.log(`✅ Successfully ran ${migrationResult[1].length} migrations:`);
        migrationResult[1].forEach((name: string) => console.log(`   - ${name}`));
      }
    } catch (migrationErr: any) {
      console.error('❌ Migration error:', migrationErr.message);
      console.error('Migration stack trace:', migrationErr.stack);
      // Don't throw, just log the error to allow server to start anyway
    }
    
  } catch (err: any) {
    console.error('❌ Database connection failed:', err.message);
    
    // Check for common error types and provide more helpful messages
    if (err.code === '28000' || err.code === '28P01') {
      console.error('🔒 Authentication failed. Please check your database credentials.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('🔌 Could not connect to the PostgreSQL server. Is it running?');
    } else if (err.code === '3D000') {
      console.error('📁 Database does not exist. Please create it first.');
      console.error('   You can create it with: CREATE DATABASE blackjack;');
    }
    
    // Always try to clean up the client
    try {
      await client.end();
    } catch (endErr) {
      // Ignore errors when ending client after connection failure
    }
    
    // Rethrow to allow caller to handle this
    throw err;
  }
};

/**
 * Properly close all database connections
 * Should be called when shutting down the server
 */
const closeAllConnections = async (): Promise<void> => {
  try {
    console.log('Closing database connections...');
    await pool.end();
    await db.destroy();
    console.log('✅ All database connections closed');
  } catch (err) {
    console.error('❌ Error closing database connections:', err);
  }
};

// Listen for process termination to clean up connections
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database connections...');
  await closeAllConnections();
});

// Export everything separately to avoid any circular references
export { pool, db, query, initDb, closeAllConnections };
export default pool;