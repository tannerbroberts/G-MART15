import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { query } from '../utils/db';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure passport with Google OAuth strategy
export default function configurePassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: '/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists in database
          const existingUser = await query(
            'SELECT * FROM users WHERE google_id = $1',
            [profile.id]
          );

          if (existingUser.rows.length > 0) {
            // User already exists, return the user
            return done(null, existingUser.rows[0]);
          }
          
          // User doesn't exist, create a new one
          // Extract email from profile
          const email = profile.emails && profile.emails[0].value;
          if (!email) {
            return done(new Error('No email found in Google profile'));
          }
          
          // Generate a temporary username from email
          const tempUsername = email.split('@')[0].substring(0, 20);
          
          // Create new user
          const newUser = await query(
            'INSERT INTO users (google_id, email, username) VALUES ($1, $2, $3) RETURNING *',
            [profile.id, email, tempUsername]
          );
          
          return done(null, newUser.rows[0]);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );

  // Serialize user to store in session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const result = await query('SELECT * FROM users WHERE id = $1', [id]);
      done(null, result.rows[0]);
    } catch (err) {
      done(err);
    }
  });
}