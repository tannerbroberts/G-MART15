// Import necessary modules
import pg from 'pg';
import Knex from 'knex';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// PostgreSQL configuration helper
const getConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`Database environment: ${isProduction ? 'production' : 'development'}`);
  
  if (process.env.DATABASE_URL) {
    // For remote databases (like Heroku)
    console.log(`Using DATABASE_URL from environment`);
    return { 
      connectionString: process.env.DATABASE_URL,
      ssl: { 
        rejectUnauthorized: false // Required for Heroku Postgres
      }
    };
  } else {
    // For local development
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || 'blackjack',
    };
    console.log(`Using local database connection: ${config.host}:${config.port}/${config.database}`);
    return config;
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
    pool: { min: 2, max: 10 },
    migrations: {
      directory: path.join(__dirname, '../../migrations')
    }
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
    console.log(`Database user: ${result.rows[0].current_user}`);
    
    // Close the test client
    await client.end();
    
    // Run migrations (only if database connection is successful)
    try {
      console.log('Running database migrations...');
      await db.migrate.latest();
      console.log('Migrations completed successfully');
    } catch (migrationErr: any) {
      console.error('Migration error:', migrationErr.message);
      // Don't throw, just log the error
    }
    
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
    
    // Rethrow to allow caller to handle this
    throw err;
  }
};

// Export everything separately to avoid any circular references
export { pool, db, query, initDb };
export default pool;