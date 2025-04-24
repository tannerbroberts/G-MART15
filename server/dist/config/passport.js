"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const db_1 = require("../utils/db");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from project root
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
// Log authentication configuration (redacted for security)
const clientId = process.env.GOOGLE_CLIENT_ID || '';
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
console.log(`OAuth Config - Client ID available: ${clientId.length > 0 ? 'Yes' : 'NO'}`);
console.log(`OAuth Config - Client Secret available: ${clientSecret.length > 0 ? 'Yes' : 'NO'}`);
// Check if credentials are missing
if (!clientId || !clientSecret) {
    console.warn('⚠️ Missing Google OAuth credentials in environment variables!');
    console.warn('Please ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env file');
}
// Environment specific callback URL
const isProduction = process.env.NODE_ENV === 'production';
const callbackURL = isProduction
    ? `${process.env.FRONTEND_URL || 'https://gmart15-blackjack-express-1946fea61846.herokuapp.com'}/auth/google/callback`
    : 'http://localhost:3000/auth/google/callback';
const configurePassport = () => {
    // Serialize user to session
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    // Deserialize user from session
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await (0, db_1.db)('users').where({ id }).first();
            done(null, user);
        }
        catch (error) {
            done(error);
        }
    });
    // Configure Google Strategy
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL,
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('Google auth callback - profile:', profile.displayName);
            // Find or create user
            let user = await (0, db_1.db)('users')
                .where({ google_id: profile.id })
                .first();
            if (!user) {
                console.log('Creating new user with Google profile');
                // Create new user if not found
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
                const username = profile.displayName ? profile.displayName.slice(0, 20) : 'User';
                const [newUser] = await (0, db_1.db)('users')
                    .insert({
                    google_id: profile.id,
                    email: email,
                    username: username,
                    balance: 1000, // Default starting balance
                })
                    .returning('*');
                user = newUser;
            }
            return done(null, user);
        }
        catch (err) {
            console.error('Error in Google authentication:', err.message);
            return done(err);
        }
    }));
};
exports.default = configurePassport;
