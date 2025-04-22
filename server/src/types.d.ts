// Type definitions for Express
import { Express } from 'express-serve-static-core';

// Extend Express User type
declare global {
  namespace Express {
    interface User {
      id: number;
      google_id?: string;
      email?: string;
      username?: string;
      [key: string]: any;
    }
  }
}

// Module declarations for JS files
declare module './utils/db' {
  import { Pool } from 'pg';
  
  export const query: (text: string, params?: any[]) => Promise<any>;
  export const initDb: () => Promise<void>;
  
  const pool: Pool;
  export default pool;
}