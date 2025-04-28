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

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // Don't exit the process, just log it
});

// Initialize the database
initDb()
  .then(() => console.log('Database initialized successfully'))
  .catch((err: Error) => {
    console.error("Database initialization failed:", err);
    // Don't exit the process, allow server to start anyway
    console.warn("Server starting despite database connection failure");
  });

// CORS configuration for development
if (!isProduction) {
  app.use(cors({
    origin: 'http://localhost:5173', // Vite dev server
    credentials: true // Allow cookies for authenticated requests
  }));
} else {
  // Production CORS setup
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://your-frontend.vercel.app', // Update with your actual Vercel URL in env
    credentials: true
  }));
}

// Session store with proper error handling
const PgSession = connectPgSimple(session);
const sessionOptions = {
  store: new PgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
    errorLog: (err: Error) => console.error('Session store error:', err)
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // Use secure cookies in production
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: isProduction ? ('none' as const) : ('lax' as const) // Properly typed as literal
  }
};

// If running in production with HTTPS
if (isProduction) {
  app.set('trust proxy', 1); // Trust first proxy
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionOptions));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Import the router from auth.ts file
import authRouter from "./routes/auth";
app.use('/auth', authRouter);

// Direct authentication routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req: Request, res: Response) => {
    // Extend req.user type to include id
    const user = req.user as { id: number } | undefined;
    console.log('Google auth callback - profile:', user ? (user as any).displayName : 'Not available');

    // Check if user exists before accessing properties
    if (!user || !user.id) {
      console.error('Authentication failed - user object invalid');
      return res.redirect('/login?error=authentication-failed');
    }
    
    // Generate JWT token for frontend authentication
    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET || 'dev-secret-key', 
      { expiresIn: '1h' }
    );
    
    // Redirect to frontend with token
    // In production, we're handling the frontend on the same domain through Express
    const redirectUrl = isProduction
      ? `/auth/callback?token=${token}` // Same domain in production
      : `http://localhost:5173/auth/callback?token=${token}`; // Separate domain in dev
      
    console.log(`Redirecting to: ${redirectUrl}`);
    res.redirect(redirectUrl);
  }
);

// API health check endpoint
app.get("/api/check", (_req: Request, res: Response) => {
  res.send('Backend is live!');
});

// Simple API endpoint example
app.get("/api/hello", (_req: Request, res: Response) => {
  res.json({ message: "Hello from server!" });
});

// Serve static files from the client's dist directory in production
if (isProduction) {
  // Static files will now be in dist/client after our heroku-postbuild script runs
  const clientPath = path.join(__dirname, '../client');
  console.log('Serving static files from:', clientPath);
  
  app.use(express.static(clientPath));
  
  // For any routes not handled by API endpoints, serve the React app
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
} else {
  // In development, we'll let the React dev server handle client-side routing
  app.get("/", (_req: Request, res: Response) => {
    res.json({ message: "API server running - React app is being served by Vite on http://localhost:5173" });
  });
}

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
  if (!isProduction) {
    console.log(`React app is running on: http://localhost:5173`);
  }
});
