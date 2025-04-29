import express, { Request, Response, NextFunction } from "express";
import path from "path";
import passport from "passport";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { Server } from "socket.io";
import { QueryResult } from "pg";
import configurePassport from "./config/passport";
import { initDb, pool, query } from "./utils/db";
import { Pool } from "mysql2";

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL || "https://your-frontend.vercel.app"
        : "http://localhost:3001",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === "production";

// Unhandled promise rejection handler
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Promise Rejection:", reason);
  // Don't exit the process, just log it
});

// Initialize the database
initDb()
  .then(() => console.log("Database initialized successfully"))
  .catch((err: Error) => {
    console.error("Database initialization failed:", err);
    // Don't exit the process, allow server to start anyway
    console.warn("Server starting despite database connection failure");
  });

// CORS configuration for development
if (!isProduction) {
  app.use(
    cors({
      origin: "http://localhost:5173", // Vite dev server
      credentials: true, // Allow cookies for authenticated requests
    })
  );
} else {
  // Production CORS setup
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "https://your-frontend.vercel.app", // Update with your actual Vercel URL in env
      credentials: true,
    })
  );
}

// Session store with proper error handling
const MySQLSessionStore = MySQLStore(session);
const sessionOptions = {
  store: new MySQLSessionStore({}, pool),
  secret: process.env.SESSION_SECRET || "dev-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction, // Use secure cookies in production
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: isProduction ? ("none" as const) : ("lax" as const), // Properly typed as literal
  },
};

// If running in production with HTTPS
if (isProduction) {
  app.set("trust proxy", 1); // Trust first proxy
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
app.use("/auth", authRouter);

// Direct authentication routes
app.post("/auth/dev-login", async (req: Request, res: Response) => {
  try {
    // Create a test user directly
    let user = null;
    const [existingUser] = await query<any[]>(
      "SELECT * FROM users WHERE email = ?",
      ["test@example.com"]
    );

    if (!existingUser) {
      await query<any[]>(
        "INSERT INTO users (email, username, balance) VALUES (?, ?, ?)",
        ["test@example.com", "Test User", 1000]
      );
      const [newUser] = await query<any[]>(
        "SELECT * FROM users WHERE email = ?",
        ["test@example.com"]
      );
      user = newUser;
    } else {
      user = existingUser;
    }

    // Create a JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "dev-secret-key",
      { expiresIn: "24h" }
    );

    // Send the token to the client
    res.json({ token });
  } catch (error) {
    console.error("Local development authentication failed:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// API health check endpoint
app.get("/api/check", (_req: Request, res: Response) => {
  res.send("Backend is live!");
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
    res.json({
      message:
        "API server running - React app is being served by Vite on http://localhost:5173",
    });
  });
}

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Handle table joining
  socket.on("join_table", (data) => {
    const { tableId, userId } = data;
    console.log(`User ${userId} joining table ${tableId}`);
    socket.join(`table:${tableId}`);
  });

  // Handle smoke break requests
  socket.on("request_smoke_break", () => {
    console.log("Smoke break requested by:", socket.id);
    // Broadcast to all clients in the same table
    socket
      .to(Array.from(socket.rooms)[1])
      .emit("player_status_update", socket.id, "smoke_break");
  });

  // Handle rejoin requests
  socket.on("request_rejoin", () => {
    console.log("Rejoin requested by:", socket.id);
    // Broadcast to all clients in the same table
    socket
      .to(Array.from(socket.rooms)[1])
      .emit("player_status_update", socket.id, "active");
  });

  // Handle game start
  socket.on("start_game", () => {
    console.log("Game start requested by:", socket.id);
    // Broadcast to all clients in the same table
    socket.to(Array.from(socket.rooms)[1]).emit("game_state_update", {
      gameStarted: true,
      currentHand: 1,
      players: [],
    });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
  console.log(`Environment: ${isProduction ? "production" : "development"}`);
  if (!isProduction) {
    console.log(`React app is running on: http://localhost:5173`);
  }
});
