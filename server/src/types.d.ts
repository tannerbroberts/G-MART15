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

// Add jsonwebtoken module declaration
declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: string | number;
    [key: string]: any;
  }
  
  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string | Buffer,
    options?: {
      algorithm?: string;
      expiresIn?: string | number;
      notBefore?: string | number;
      audience?: string | string[];
      issuer?: string;
      jwtid?: string;
      subject?: string;
      noTimestamp?: boolean;
      header?: object;
      keyid?: string;
    }
  ): string;
  
  export function verify(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: {
      algorithms?: string[];
      audience?: string | string[];
      clockTimestamp?: number;
      complete?: boolean;
      issuer?: string | string[];
      jwtid?: string;
      ignoreExpiration?: boolean;
      ignoreNotBefore?: boolean;
      subject?: string;
      clockTolerance?: number;
      maxAge?: string | number;
      nonce?: string;
    }
  ): JwtPayload | string;
  
  export function decode(
    token: string,
    options?: {
      complete?: boolean;
      json?: boolean;
    }
  ): null | JwtPayload | string;
}