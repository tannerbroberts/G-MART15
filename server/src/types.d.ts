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

// We don't need to declare the db module here since we're using actual TypeScript
// implementation with proper exports