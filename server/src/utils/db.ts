// Import necessary modules
import mysql, {
  Pool,
  QueryError,
  RowDataPacket,
  ResultSetHeader,
  PoolOptions,
} from "mysql2";
import Knex from "knex";
import type { Knex as KnexType } from "knex";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Type definitions for database configuration
type DatabaseConfig = {
  uri?: string;
  user?: string;
  password?: string;
  database?: string;
  host?: string;
  port?: number;
  socketPath?: string;
  connectTimeout?: number;
  waitForConnections?: boolean;
  connectionLimit?: number;
  maxIdle?: number;
  idleTimeout?: number;
  queueLimit?: number;
};

// MySQL configuration helper
const getConfig = (): DatabaseConfig => {
  if (process.env.DATABASE_URL) {
    // For remote databases
    return {
      uri: process.env.DATABASE_URL,
    };
  } else {
    // For local development
    const config: DatabaseConfig = {
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_DATABASE || "blackjack",
      connectTimeout: 10000, // 10 seconds
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
    };

    // Use socket connection on macOS
    if (process.platform === "darwin") {
      return {
        ...config,
        socketPath: "/tmp/mysql.sock",
      };
    } else {
      return {
        ...config,
        host: process.env.DB_HOST || "127.0.0.1",
        port: parseInt(process.env.DB_PORT || "3306", 10),
      };
    }
  }
};

// Create a simple client for testing connection
const createTestClient = () => {
  const config = getConfig();
  if (!config.password) {
    console.error(
      "⚠️ Warning: No database password set in environment variables!"
    );
  }
  console.log("Database config:", {
    ...config,
    password: config.password ? "[REDACTED]" : "NOT SET",
  });
  return mysql.createConnection(config as PoolOptions);
};

// Create a MySQL pool
const createPool = () => {
  const config = getConfig();
  if (!config.password) {
    console.error(
      "⚠️ Warning: No database password set in environment variables!"
    );
  }
  console.log("Creating pool with config:", {
    ...config,
    password: config.password ? "[REDACTED]" : "NOT SET",
  });
  return mysql.createPool(config as PoolOptions);
};

// Create a Knex instance
const createKnex = () => {
  return Knex({
    client: "mysql2",
    connection: getConfig(),
    pool: { min: 2, max: 10 },
  });
};

// Create instances
let pool: Pool;
let db: KnexType;

try {
  pool = createPool();
  db = createKnex();
} catch (error) {
  console.error("Failed to create database instances:", error);
  // Create empty instances to prevent crashes
  pool = mysql.createPool({});
  db = Knex({ client: "mysql2" });
}

// Query function
const query = <T extends RowDataPacket[] | ResultSetHeader>(
  text: string,
  params?: any[]
): Promise<T> => {
  return new Promise((resolve, reject) => {
    pool.query<T>(text, params, (err: QueryError | null, results: T) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Database initialization function with better error handling
const initDb = async (): Promise<void> => {
  // Use a separate client for testing, not the pool
  const client = createTestClient();

  try {
    await new Promise<void>((resolve, reject) => {
      client.connect((err: QueryError | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("✅ Database connection successful");

    // Simplified database info query for MySQL
    const [result] = await new Promise<RowDataPacket[]>((resolve, reject) => {
      client.query<RowDataPacket[]>(
        "SELECT VERSION() as version, DATABASE() as current_database",
        (err: QueryError | null, results: RowDataPacket[]) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });
    console.log(`Connected to: ${result.current_database}`);
    console.log(`MySQL version: ${result.version}`);

    await new Promise<void>((resolve, reject) => {
      client.end((err: QueryError | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch (err: unknown) {
    console.error(
      "❌ Database connection failed:",
      err instanceof Error ? err.message : String(err)
    );

    // Check for common error types and provide more helpful messages
    if (err instanceof Error) {
      if (err.message.includes("ER_ACCESS_DENIED_ERROR")) {
        console.error(
          "Authentication failed. Please check your database credentials in the .env file."
        );
      } else if (err.message.includes("ECONNREFUSED")) {
        console.error(
          "Connection refused. Please ensure MySQL is running and the port is correct."
        );
      } else if (err.message.includes("ER_BAD_DB_ERROR")) {
        console.error(
          "Database does not exist. Please create the database first."
        );
      }
    }
    throw err;
  }
};

// Export everything separately to avoid any circular references
export { pool, db, query, initDb };
export default pool;
