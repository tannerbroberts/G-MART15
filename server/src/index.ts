import express, { Request, Response } from "express";
import path from "path";
import passport from "passport";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import configurePassport from "./config/passport";
import authRoutes from "./routes/auth";
import { initDb } from "./utils/db";
import pool from "./utils/db";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Initialize the database
initDb().catch((err: Error) => {
  console.error("Database initialization failed:", err);
  process.exit(1);
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

// Session store
const PgSession = connectPgSimple(session);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration - THIS is what prevents data loss across dyno restarts
app.use(
  session({
    store: new PgSession({
      pool, // Same pool used for queries
      tableName: 'session', // Use the session table we created
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // Use secure cookies in production
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: isProduction ? 'strict' : 'lax'
    }
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// API Routes
app.use('/auth', authRoutes);

// Direct authentication routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/' }),
  (req: Request, res: Response) => {
    // Check if user exists before accessing properties
    if (!req.user || !req.user.id) {
      return res.redirect('/login?error=authentication-failed');
    }
    
    // Generate JWT token for frontend authentication
    const token = jwt.sign(
      { id: req.user.id }, 
      process.env.JWT_SECRET || 'dev-secret-key', 
      { expiresIn: '1h' }
    );
    
    // Redirect to frontend with token
    const redirectUrl = isProduction
      ? `${process.env.FRONTEND_URL || 'https://your-frontend.vercel.app'}/auth/callback?token=${token}`
      : `http://localhost:5173/auth/callback?token=${token}`;
      
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
  app.use(express.static(path.join(__dirname, "../../dist")));
  
  // For any routes not handled by API endpoints, serve the React app
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../dist/index.html"));
  });
} else {
  // In development, we'll let the React dev server handle client-side routing
  app.get("/", (_req: Request, res: Response) => {
    res.json({ message: "API server running - React app is being served by Vite on http://localhost:5173" });
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
  if (!isProduction) {
    console.log(`React app is running on: http://localhost:5173`);
  }
});
