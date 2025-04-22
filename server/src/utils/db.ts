import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Determine if we're in production (Heroku)
const isProduction = process.env.NODE_ENV === 'production';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_DATABASE}`,
  ssl: isProduction ? { rejectUnauthorized: false } : false // Required for Heroku Postgres
});

// Export a query function
export const query = (text: string, params?: any[]) => pool.query(text, params);

// Export a function to initialize the database
export async function initDb() {
  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id TEXT UNIQUE,
        email TEXT UNIQUE NOT NULL,
        username VARCHAR(20) NOT NULL,
        balance INTEGER DEFAULT 1000,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Game tables table
    await query(`
      CREATE TABLE IF NOT EXISTS game_tables (
        id SERIAL PRIMARY KEY,
        table_id VARCHAR(20) UNIQUE NOT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        last_activity TIMESTAMP DEFAULT NOW()
      )
    `);

    // Players at tables
    await query(`
      CREATE TABLE IF NOT EXISTS players_tables (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        table_id INTEGER REFERENCES game_tables(id),
        seat_position INTEGER,
        joined_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Session store table (for connect-pg-simple)
    await query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      )
    `);

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database', err);
  }
}

export default pool;