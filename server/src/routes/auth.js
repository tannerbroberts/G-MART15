import passport from 'passport';
import { Router } from 'express';
import dotenv from 'dotenv';
import path from 'path';

// Create an express router
const router = Router();

// Load environment variables from project root .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Define routes for authentication
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

// Health check endpoint
router.get('/check', (req, res) => {
  res.status(200).json({ status: 'Authentication routes working' });
});

// Export the router
export default router;