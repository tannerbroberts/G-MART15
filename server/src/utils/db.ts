// Import necessary modules
import pg from 'pg';
import Knex from 'knex';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// PostgreSQL configuration helper
const getConfig = () => {
  if (process.env.DATABASE_URL) {
    // For remote databases (like Heroku), ensure SSL is configured properly
    return { 
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    };
  } else {
    // For local development
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || 'blackjack',
    };
  }
};

// Create a simple client for testing connection
const createTestClient = () => {
  return new pg.Client(getConfig());
};

// Create a PostgreSQL pool
const createPool = () => {
  const { Pool } = pg;
  return new Pool(getConfig());
};

// Create a Knex instance
const createKnex = () => {
  return Knex({
    client: 'pg',
    connection: getConfig(),
    pool: { min: 2, max: 10 }
  });
};

// Create instances
const pool = createPool();
const db = createKnex();

// Query function
const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

// Database initialization function with better error handling
const initDb = async (): Promise<void> => {
  // Use a separate client for testing, not the pool
  const client = createTestClient();
  
  try {
    await client.connect();
    console.log('✅ Database connection successful');
    
    // Additional database info query
    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log(`Connected to: ${result.rows[0].current_database}`);
    console.log(`PostgreSQL version: ${result.rows[0].version.split(' ')[1]}`);
    
    await client.end();
  } catch (err: any) {
    console.error('❌ Database connection failed:', err.message);
    
    // Check for common error types and provide more helpful messages
    if (err.code === '28000' || err.code === '28P01') {
      console.error('Authentication failed. Please check your database credentials.');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('Could not connect to the PostgreSQL server. Is it running?');
    }
    
    // Always try to clean up the client
    try {
      await client.end();
    } catch (endErr) {
      // Ignore errors when ending client after connection failure
    }
    
    // Don't rethrow, just log the error - this allows server to start without DB
    console.warn('Server will start despite database connection issues');
  }
};

// Export everything separately to avoid any circular references
export { pool, db, query, initDb };
export default pool;