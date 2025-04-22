require('dotenv').config({ path: '../.env' });
const { Client } = require('pg');
const readline = require('readline');

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupDatabase() {
  console.log('Setting up database for G-MART15...');
  
  try {
    // Connect to PostgreSQL server to create database if it doesn't exist
    const adminClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: 'postgres' // Connect to default database to create our app database
    });

    await adminClient.connect();
    console.log('Connected to PostgreSQL server');

    // Check if database exists
    const dbCheckResult = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1", 
      [process.env.DB_DATABASE || 'blackjack']
    );

    if (dbCheckResult.rows.length === 0) {
      console.log(`Creating database: ${process.env.DB_DATABASE || 'blackjack'}`);
      await adminClient.query(`CREATE DATABASE ${process.env.DB_DATABASE || 'blackjack'}`);
      console.log('Database created successfully');
    } else {
      console.log(`Database ${process.env.DB_DATABASE || 'blackjack'} already exists`);
    }

    await adminClient.end();

    // Connect to our app database to set up tables
    const appClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE || 'blackjack'
    });

    await appClient.connect();
    console.log(`Connected to ${process.env.DB_DATABASE || 'blackjack'} database`);

    // Create tables
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id TEXT UNIQUE,
        email TEXT UNIQUE NOT NULL,
        username VARCHAR(20) NOT NULL,
        balance INTEGER DEFAULT 1000,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await appClient.query(`
      CREATE TABLE IF NOT EXISTS game_tables (
        id SERIAL PRIMARY KEY,
        table_id VARCHAR(20) UNIQUE NOT NULL,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        last_activity TIMESTAMP DEFAULT NOW()
      )
    `);

    await appClient.query(`
      CREATE TABLE IF NOT EXISTS players_tables (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        table_id INTEGER REFERENCES game_tables(id),
        seat_position INTEGER,
        joined_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await appClient.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
    `);

    console.log('Database tables created successfully');
    await appClient.end();
    
    console.log('Database setup completed successfully!');
    console.log('\nTo start the development environment, run:');
    console.log('npm start');
    
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    rl.close();
  }
}

setupDatabase();