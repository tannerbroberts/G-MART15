/**
 * G-MART15 Blackjack Server
 * ------------------------------------------------------------------------------
 * Main server entry point for the Express.js backend.
 * 
 * Architecture Overview:
 * - Express.js web server with TypeScript
 * - PostgreSQL database with Knex query builder
 * - Passport.js for Google OAuth authentication
 * - JWT for frontend authentication
 * - Session management with connect-pg-simple
 * 
 * Deployment: This server is deployed to Heroku and serves the React frontend
 * in production, while in development the frontend is served by Vite.
 */

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import passport from "passport";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import configurePassport from "./config/passport";
import { initDb } from "./utils/db";
import pool from "./utils/db";

// Load environment variables from .env file (if present)
dotenv.config();

// Application constants
const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://gmart15-blackjack.vercel.app';

/**
 * --------------------------------------------------------------------------
 * GLOBAL ERROR HANDLING SETUP
 * --------------------------------------------------------------------------
 * These handlers catch unhandled promise rejections and exceptions to prevent
 * the server from crashing in production.
 */

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', reason);
  if (isProduction) {
    console.error('Promise details:', promise);
    console.error('Timestamp:', new Date().toISOString());
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  console.error('Timestamp:', new Date().toISOString());
  
  // Only exit in development - production should try to recover
  if (!isProduction) {
    process.exit(1);
  }
});

/**
 * --------------------------------------------------------------------------
 * DATABASE INITIALIZATION
 * --------------------------------------------------------------------------
 * Initialize the database connection with enhanced logging
 */
initDb()
  .then(() => console.log(`✅ Database initialized successfully - ${new Date().toISOString()}`))
  .catch((err: Error) => {
    console.error("❌ Database initialization failed:", err);
    console.error("Error details:", JSON.stringify({
      message: err.message,
      name: err.name,
      stack: isProduction ? 'Omitted in production' : err.stack
    }));
    console.warn("Server starting despite database connection failure");
  });

/**
 * --------------------------------------------------------------------------
 * MIDDLEWARE SETUP
 * --------------------------------------------------------------------------
 */

// Request logging middleware with performance timing
app.use((req: Request, res: Response, next: NextFunction) => {
  // Skip logging for health check endpoints in production
  if (isProduction && req.path === '/api/check') {
    return next();
  }
  
  const startTime = Date.now();
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  
  // Log response when sent
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const logMethod = statusCode >= 400 ? console.error : console.log;
    logMethod(`📤 ${new Date().toISOString()} - Response: ${statusCode} - ${req.method} ${req.path} (${duration}ms)`);
  });
  
  next();
});

// FIX: Handle potential path-to-regexp error with URLs in route paths
// This middleware safely handles redirection to external URLs
app.use((req: Request, res: Response, next: NextFunction) => {
  // Check if this is a request that's trying to use a URL as a path
  if (req.path.startsWith('/https:/') || req.path.startsWith('/http:/')) {
    const actualUrl = req.path.substring(1); // Remove the leading slash
    console.log(`🔄 Redirecting URL-as-path to: ${actualUrl}`);
    return res.redirect(actualUrl);
  }
  next();
});

// CORS configuration
if (!isProduction) {
  // Development - allow requests from Vite dev server
  app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
  }));
} else {
  // Production - allow requests from Vercel frontend
  app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
  }));
}

// Body parsers for JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * --------------------------------------------------------------------------
 * SESSION CONFIGURATION
 * --------------------------------------------------------------------------
 * Uses PostgreSQL to store session data between requests
 */
const PgSession = connectPgSimple(session);
const sessionOptions = {
  store: new PgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
    errorLog: (err: Error) => console.error('Session store error:', err)
  }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: isProduction ? ('none' as const) : ('lax' as const)
  }
};

// Trust first proxy in production (needed for secure cookies behind Heroku proxy)
if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(session(sessionOptions));

/**
 * --------------------------------------------------------------------------
 * AUTHENTICATION SETUP
 * --------------------------------------------------------------------------
 */
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Import authentication routes
import authRouter from "./routes/auth";
app.use('/auth', authRouter);

// Direct Google authentication routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req: Request, res: Response) => {
    try {
      // Type assertion for user object with required id field
      const user = req.user as { id: number } | undefined;
      
      if (!user || !user.id) {
        console.error('Authentication failed - invalid user object:', user);
        return res.redirect('/login?error=authentication-failed');
      }
      
      // Generate JWT token for frontend authentication
      const token = jwt.sign(
        { id: user.id }, 
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      // Redirect with token - different paths for dev vs production
      const redirectUrl = isProduction
        ? `/auth/callback?token=${token}`
        : `http://localhost:5173/auth/callback?token=${token}`;
        
      console.log(`✅ Authentication successful, redirecting to: ${redirectUrl}`);
      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('❌ Error in Google auth callback:', error);
      return res.redirect('/login?error=server-error');
    }
  }
);

// FIX: Handle URL paths that cause path-to-regexp errors
// Instead of defining a specific route that TypeScript has issues with,
// use this more general middleware approach
app.use((req: Request, res: Response, next: NextFunction) => {
  // Check for paths that might cause path-to-regexp errors
  if (req.path.startsWith('/git.new')) {
    const fullPath = `https:${req.path.substring(1)}`; // Remove leading slash and add https:
    console.log(`🔄 Redirecting from problematic path to: ${fullPath}`);
    return res.redirect(fullPath);
  }
  next();
});

/**
 * --------------------------------------------------------------------------
 * API ROUTES
 * --------------------------------------------------------------------------
 */

// Health check endpoint (used by deployment healthchecks)
app.get("/api/check", (_req: Request, res: Response) => {
  res.send('Backend is live!');
});

// Example API endpoint
app.get("/api/hello", (_req: Request, res: Response) => {
  res.json({ message: "Hello from server!" });
});

/**
 * --------------------------------------------------------------------------
 * STATIC FILE SERVING (PRODUCTION ONLY)
 * --------------------------------------------------------------------------
 * In production, serve the React frontend from this Express server
 */
if (isProduction) {
  // Possible locations for client files based on deployment configuration
  const possiblePaths = [
    path.join(__dirname, '../client/dist'),
    path.join(__dirname, '../../client/dist'),
    path.join(__dirname, '../public'),
    path.join(__dirname, '../dist'),
    path.join(__dirname, '../dist/client')
  ];
  
  // Find the first path that exists
  let clientDistPath: string | null = null;
  for (const testPath of possiblePaths) {
    try {
      if (require('fs').existsSync(testPath)) {
        console.log(`✅ Found static files at: ${testPath}`);
        clientDistPath = testPath;
        break;
      }
    } catch (err) {
      // Ignore errors checking paths
    }
  }
  
  // Fallback path if none of the above exist
  if (!clientDistPath) {
    console.error('❌ Could not find static file directory!');
    clientDistPath = path.join(process.cwd(), 'dist');
    console.log(`Using fallback path: ${clientDistPath}`);
  }
  
  // Serve static files
  app.use(express.static(clientDistPath));
  
  // Serve index.html for all non-API routes (client-side routing)
  const serveIndexHtml = (req: Request, res: Response, next: NextFunction) => {
    // Skip API and auth routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) {
      return next();
    }
    
    try {
      const indexPath = path.join(clientDistPath, "index.html");
      if (require('fs').existsSync(indexPath)) {
        return res.sendFile(indexPath);
      } else {
        console.error(`❌ Index file not found at ${indexPath}`);
        return res.status(404).send('Application files not found');
      }
    } catch (err) {
      console.error('❌ Error serving index.html:', err);
      return res.status(500).send('Error loading application');
    }
  };
  
  app.get('/*', serveIndexHtml);
  
} else {
  // Development message
  app.get("/", (_req: Request, res: Response) => {
    res.json({ 
      message: "API server running - React app is being served separately by Vite",
      clientUrl: "http://localhost:5173"
    });
  });
}

/**
 * --------------------------------------------------------------------------
 * GLOBAL ERROR HANDLER
 * --------------------------------------------------------------------------
 */
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Server error:', err);
  
  // Log additional details in production
  if (isProduction) {
    console.error('Request path:', req.path);
    console.error('Request body:', req.body);
    console.error('Timestamp:', new Date().toISOString());
  }
  
  res.status(500).json({ 
    message: 'Internal server error',
    requestId: req.ip + '-' + Date.now()  // Helps correlate user reports with logs
  });
});

/**
 * --------------------------------------------------------------------------
 * SERVER STARTUP
 * --------------------------------------------------------------------------
 */
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔧 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  
  if (isProduction) {
    console.log(`🌐 Frontend served from static files`);
  } else {
    console.log(`🌐 Frontend URL: http://localhost:5173`);
  }
  
  console.log(`🔄 API health check: http://localhost:${PORT}/api/check`);
  console.log(`\n📝 Server initialization complete - ${new Date().toISOString()}\n`);
});
