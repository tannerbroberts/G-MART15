"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = exports.query = exports.db = exports.pool = void 0;
// Import necessary modules
const pg_1 = __importDefault(require("pg"));
const knex_1 = __importDefault(require("knex"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Load environment variables with better error handling
try {
    const envPath = path_1.default.resolve(__dirname, '../../../.env');
    if (fs_1.default.existsSync(envPath)) {
        dotenv_1.default.config({ path: envPath });
        console.log('Loaded .env file from:', envPath);
    }
    else {
        console.log('No .env file found at', envPath, 'using environment variables only');
        dotenv_1.default.config(); // Try default location as fallback
    }
}
catch (err) {
    console.warn('Error loading .env file, falling back to environment variables:', err);
}
// PostgreSQL configuration helper
const getConfig = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    console.log(`Database environment: ${isProduction ? 'production' : 'development'}`);
    // For Heroku, use DATABASE_URL (automatically set by Heroku PostgreSQL addon)
    if (process.env.DATABASE_URL) {
        console.log('Using DATABASE_URL from environment');
        const config = {
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false // Required for Heroku Postgres
            }
        };
        // Log partial connection string for debugging (hiding credentials)
        const urlParts = process.env.DATABASE_URL.split('@');
        if (urlParts.length > 1) {
            console.log(`Connection to: ${urlParts[1].split('/')[0]}`);
        }
        return config;
    }
    else {
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
    return new pg_1.default.Client(getConfig());
};
// Create a PostgreSQL pool
const createPool = () => {
    const { Pool } = pg_1.default;
    return new Pool(getConfig());
};
// Create a Knex instance
const createKnex = () => {
    return (0, knex_1.default)({
        client: 'pg',
        connection: getConfig(),
        pool: { min: 2, max: 10 },
        migrations: {
            directory: path_1.default.join(__dirname, '../../migrations')
        }
    });
};
// Create instances
const pool = createPool();
exports.pool = pool;
const db = createKnex();
exports.db = db;
// Query function
const query = (text, params) => {
    return pool.query(text, params);
};
exports.query = query;
// Database initialization function with better error handling
const initDb = async () => {
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
        }
        catch (migrationErr) {
            console.error('Migration error:', migrationErr.message);
            // Don't throw, just log the error
        }
    }
    catch (err) {
        console.error('❌ Database connection failed:', err.message);
        // Check for common error types and provide more helpful messages
        if (err.code === '28000' || err.code === '28P01') {
            console.error('Authentication failed. Please check your database credentials.');
        }
        else if (err.code === 'ECONNREFUSED') {
            console.error('Could not connect to the PostgreSQL server. Is it running?');
        }
        // Always try to clean up the client
        try {
            await client.end();
        }
        catch (endErr) {
            // Ignore errors when ending client after connection failure
        }
        // Rethrow to allow caller to handle this
        throw err;
    }
};
exports.initDb = initDb;
exports.default = pool;
