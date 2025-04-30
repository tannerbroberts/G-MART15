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
// Enhanced error handling for production
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:', reason);
    // Log additional context in production
    if (isProduction) {
        console.error('Promise details:', promise);
        console.error('Timestamp:', new Date().toISOString());
    }
});
// Add global exception handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.error('Timestamp:', new Date().toISOString());
    // Don't exit in production, but log it thoroughly
    if (!isProduction) {
        process.exit(1); // Only exit in development
    }
});
// Initialize the database with enhanced logging
(0, db_1.initDb)()
    .then(() => console.log(`✅ Database initialized successfully - ${new Date().toISOString()}`))
    .catch((err) => {
    console.error("❌ Database initialization failed:", err);
    console.error("Error details:", JSON.stringify({
        message: err.message,
        name: err.name,
        stack: isProduction ? 'Omitted in production' : err.stack
    }));
    console.warn("Server starting despite database connection failure");
});
// Request logging middleware
app.use((req, res, next) => {
    // Skip logging for health check endpoints in production to avoid cluttering logs
    if (isProduction && req.path === '/api/check') {
        return next();
    }
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
    // Log response when it's sent
    res.on('finish', () => {
        const statusCode = res.statusCode;
        const logMethod = statusCode >= 400 ? console.error : console.log;
        logMethod(`${new Date().toISOString()} - Response: ${statusCode} - ${req.method} ${req.path}`);
    });
    next();
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
// Fix the TypeScript error in the Google auth callback route
app.get('/auth/google/callback', passport_1.default.authenticate('google', { session: false, failureRedirect: '/' }), (req, res) => {
    try {
        // Extend req.user type to include id
        const user = req.user;
        console.log('Google auth callback - profile:', user ? user.displayName : 'Not available');
        // Check if user exists before accessing properties
        if (!user || !user.id) {
            console.error('Authentication failed - user object invalid');
            return res.redirect('/login?error=authentication-failed');
        }
        // Generate JWT token for frontend authentication
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '1h' });
        // Redirect to frontend with token
        // In production, we're handling the frontend on the same domain through Express
        const redirectUrl = isProduction
            ? `/auth/callback?token=${token}` // Same domain in production
            : `http://localhost:5173/auth/callback?token=${token}`; // Separate domain in dev
        console.log(`Redirecting to: ${redirectUrl}`);
        return res.redirect(redirectUrl);
    }
    catch (error) {
        console.error('Error in Google auth callback:', error);
        return res.redirect('/login?error=server-error');
    }
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
    // In Heroku, when using subtree push, the static files need to be relative to the server
    // We'll check multiple possible locations for the client files
    const possiblePaths = [
        path_1.default.join(__dirname, '../client/dist'), // If client was built in server directory
        path_1.default.join(__dirname, '../../client/dist'), // From default structure
        path_1.default.join(__dirname, '../public'), // Conventional public folder
        path_1.default.join(__dirname, '../dist'), // If client build was copied to server/dist
        path_1.default.join(__dirname, '../dist/client') // Another possible location
    ];
    let clientDistPath = null;
    // Find the first path that exists
    for (const testPath of possiblePaths) {
        try {
            if (require('fs').existsSync(testPath)) {
                console.log(`✅ Found static files at: ${testPath}`);
                clientDistPath = testPath;
                break;
            }
        }
        catch (err) {
            // Ignore errors checking paths
        }
    }
    if (!clientDistPath) {
        console.error('❌ Could not find static file directory in any expected location!');
        console.log('Working directory:', process.cwd());
        console.log('__dirname:', __dirname);
        // Fallback to current directory + dist as last resort
        clientDistPath = path_1.default.join(process.cwd(), 'dist');
        console.log(`Using fallback path: ${clientDistPath}`);
    }
    // Try to serve static files
    app.use(express_1.default.static(clientDistPath));
    // Define a middleware function separately to avoid TypeScript errors
    const serveIndexHtml = (req, res, next) => {
        // Skip API and auth routes
        if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) {
            return next();
        }
        try {
            const indexPath = path_1.default.join(clientDistPath, "index.html");
            if (require('fs').existsSync(indexPath)) {
                return res.sendFile(indexPath);
            }
            else {
                console.error(`Index file not found at ${indexPath}`);
                return res.status(404).send('Application files not found');
            }
        }
        catch (err) {
            console.error('Error serving index.html:', err);
            return res.status(500).send('Error loading application');
        }
    };
    // Apply the middleware to all routes
    app.get('/*', serveIndexHtml);
}
else {
    // In development, we'll let the React dev server handle client-side routing
    app.get("/", function (_req, res) {
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
