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
    // Determine if we're using DATABASE_URL or individual params
    let clientConfig;
    
    if (process.env.DATABASE_URL) {
      console.log('Using DATABASE_URL for connection');
      clientConfig = {
        connectionString: process.env.DATABASE_URL,
        // Add SSL support for production (Heroku)
        ssl: process.env.NODE_ENV === 'production' 
          ? { rejectUnauthorized: false }
          : false
      };
    } else {
      console.log('Using individual connection parameters');
      clientConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: 'postgres' // Connect to default database to create our app database
      };
    }

    // First check if we can connect to PostgreSQL server
    const adminClient = new Client(clientConfig);

    try {
      await adminClient.connect();
      console.log('Connected to PostgreSQL server');
    } catch (error) {
      console.error('Failed to connect to PostgreSQL server. Please check your connection settings:');
      console.error(`Host: ${clientConfig.host || 'from connection string'}`);
      console.error(`Port: ${clientConfig.port || 'from connection string'}`);
      console.error(`User: ${clientConfig.user || 'from connection string'}`);
      console.error(`Database: ${clientConfig.database || 'from connection string'}`);
      console.error('Error details:', error.message);
      process.exit(1);
    }

    // Using DATABASE_URL we might already be connected to our target DB
    const dbName = process.env.DB_DATABASE || 'blackjack';
    
    if (!process.env.DATABASE_URL) {
      // Check if database exists
      const dbCheckResult = await adminClient.query(
        "SELECT 1 FROM pg_database WHERE datname = $1", 
        [dbName]
      );

      if (dbCheckResult.rows.length === 0) {
        console.log(`Creating database: ${dbName}`);
        await adminClient.query(`CREATE DATABASE ${dbName}`);
        console.log('Database created successfully');
      } else {
        console.log(`Database ${dbName} already exists`);
      }
    }

    await adminClient.end();

    // Connect to our app database to set up tables
    const appClientConfig = process.env.DATABASE_URL 
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        }
      : {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD,
          database: dbName
        };

    const appClient = new Client(appClientConfig);

    try {
      await appClient.connect();
      console.log(`Connected to ${dbName} database`);
    } catch (error) {
      console.error(`Failed to connect to ${dbName} database:`, error.message);
      process.exit(1);
    }

    // Create tables
    try {
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
    } catch (error) {
      console.error('Error creating tables:', error.message);
      process.exit(1);
    }
    
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