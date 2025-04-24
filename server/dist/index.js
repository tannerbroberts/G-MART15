"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_2 = __importDefault(require("./config/passport"));
const db_1 = require("./utils/db");
const db_2 = __importDefault(require("./utils/db"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';
// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:', reason);
    // Don't exit the process, just log it
});
// Initialize the database
(0, db_1.initDb)()
    .then(() => console.log('Database initialized successfully'))
    .catch((err) => {
    console.error("Database initialization failed:", err);
    // Don't exit the process, allow server to start anyway
    console.warn("Server starting despite database connection failure");
});
// CORS configuration for development
if (!isProduction) {
    app.use((0, cors_1.default)({
        origin: 'http://localhost:5173', // Vite dev server
        credentials: true // Allow cookies for authenticated requests
    }));
}
else {
    // Production CORS setup
    app.use((0, cors_1.default)({
        origin: process.env.FRONTEND_URL || 'https://your-frontend.vercel.app', // Update with your actual Vercel URL in env
        credentials: true
    }));
}
// Session store with proper error handling
const PgSession = (0, connect_pg_simple_1.default)(express_session_1.default);
const sessionOptions = {
    store: new PgSession({
        pool: db_2.default,
        tableName: 'session',
        createTableIfMissing: true,
        errorLog: (err) => console.error('Session store error:', err)
    }),
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProduction, // Use secure cookies in production
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: isProduction ? 'none' : 'lax' // Properly typed as literal
    }
};
// If running in production with HTTPS
if (isProduction) {
    app.set('trust proxy', 1); // Trust first proxy
}
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_session_1.default)(sessionOptions));
// Initialize passport
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
(0, passport_2.default)();
// Import the router from auth.ts file
const auth_1 = __importDefault(require("./routes/auth"));
app.use('/auth', auth_1.default);
// Direct authentication routes
app.get('/auth/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport_1.default.authenticate('google', { session: false, failureRedirect: '/' }), (req, res) => {
    // Extend req.user type to include id
    const user = req.user;
    // Check if user exists before accessing properties
    if (!user || !user.id) {
        return res.redirect('/login?error=authentication-failed');
    }
    // Generate JWT token for frontend authentication
    const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '1h' });
    // Redirect to frontend with token
    const redirectUrl = isProduction
        ? `${process.env.FRONTEND_URL || 'https://your-frontend.vercel.app'}/auth/callback?token=${token}`
        : `http://localhost:5173/auth/callback?token=${token}`;
    res.redirect(redirectUrl);
});
// API health check endpoint
app.get("/api/check", (_req, res) => {
    res.send('Backend is live!');
});
// Simple API endpoint example
app.get("/api/hello", (_req, res) => {
    res.json({ message: "Hello from server!" });
});
// Serve static files from the client's dist directory in production
if (isProduction) {
    app.use(express_1.default.static(path_1.default.join(__dirname, "../../dist")));
    // For any routes not handled by API endpoints, serve the React app
    app.get("*", (_req, res) => {
        res.sendFile(path_1.default.join(__dirname, "../../dist/index.html"));
    });
}
else {
    // In development, we'll let the React dev server handle client-side routing
    app.get("/", (_req, res) => {
        res.json({ message: "API server running - React app is being served by Vite on http://localhost:5173" });
    });
}
// Global error handler
app.use((err, req, res, next) => {
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
