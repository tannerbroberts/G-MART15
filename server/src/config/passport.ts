import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from '../utils/db';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

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
// Fix the callback URL to always use the correct domain
const callbackURL = isProduction
  ? 'https://gmart15-blackjack-express-1946fea61846.herokuapp.com/auth/google/callback'
  : 'http://localhost:3000/auth/google/callback';

console.log(`Google OAuth callback URL: ${callbackURL}`);

const configurePassport = () => {
  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: any, done) => {
    try {
      const user = await db('users').where({ id }).first();
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Configure Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL,
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('Google auth callback - profile:', profile.displayName);
          
          // Find or create user
          let user = await db('users')
            .where({ google_id: profile.id })
            .first();

          if (!user) {
            console.log('Creating new user with Google profile');
            // Create new user if not found
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
            const username = profile.displayName ? profile.displayName.slice(0, 20) : 'User';
            
            const [newUser] = await db('users')
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
        } catch (err: any) {
          console.error('Error in Google authentication:', err.message);
          return done(err);
        }
      }
    )
  );
};

export default configurePassport;