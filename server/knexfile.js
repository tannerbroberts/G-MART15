/**
 * Knex.js Database Configuration File
 * ------------------------------------------------------------------------------
 * This file configures the connection to the PostgreSQL database for:
 * - Local development: Using localhost PostgreSQL instance
 * - Production: Using Heroku PostgreSQL add-on via DATABASE_URL env variable
 * 
 * The configuration is used by:
 * - Migration commands (knex migrate:latest)
 * - Knex query builder instances in the application code
 * - The release phase in the Heroku Procfile
 */

// Set up SSL configuration for production (Heroku)
const sslConfig = {
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Connection configurations
const productionConfig = {
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ...sslConfig
  },
  migrations: { directory: './migrations' },
  pool: { min: 2, max: 10 },
  acquireConnectionTimeout: 10000
};

const developmentConfig = {
  client: 'pg',
  connection: 'postgres://localhost:5432/blackjack',
  migrations: { directory: './migrations' },
  pool: { min: 2, max: 10 },
  acquireConnectionTimeout: 10000
};

// Choose config based on environment
export default process.env.DATABASE_URL ? productionConfig : developmentConfig;

