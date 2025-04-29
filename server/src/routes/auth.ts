import express, { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { db } from '../utils/db';

// Define custom type for the auth request with user
interface AuthRequest extends Request {
  user?: {
    id: number;
    google_id?: string;
    email: string;
    username: string;
    [key: string]: any;  // For any additional properties
  };
}

const authRouter: Router = express.Router();

// Auth routes
authRouter.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

authRouter.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  ((req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      if (!authReq.user) {
        return res.redirect('/login?error=authentication-failed');
      }

      const token = jwt.sign(
        { id: authReq.user.id },
        process.env.JWT_SECRET || 'dev-secret-key',
        { expiresIn: '1h' }
      );

      const isProduction = process.env.NODE_ENV === 'production';
      const redirectUrl = isProduction
        ? `${process.env.FRONTEND_URL || 'https://your-frontend.vercel.app'}/auth/callback?token=${token}`
        : `http://localhost:5173/auth/callback?token=${token}`;

      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }) as RequestHandler
);

// Status route using simple callback
authRouter.get('/status', ((req: Request, res: Response, next: NextFunction) => {
  try {
    const isAuthenticated = req.isAuthenticated?.();

    if (isAuthenticated) {
      return res.json({
        isAuthenticated: true,
        user: req.user
      });
    } else {
      return res.json({ isAuthenticated: false });
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

// Logout route using simple callback
authRouter.post('/logout', ((req: Request, res: Response, next: NextFunction) => {
  try {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      } else {
        return res.json({ message: 'Logged out successfully' });
      }
    });
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

// Development-only login route
if (process.env.NODE_ENV !== 'production') {
  authRouter.post('/dev-login', async (req: Request, res: Response) => {
    try {
      // Create or find a test user
      let user = await db("users")
        .where({ email: "test@example.com" })
        .first();

      if (!user) {
        const [newUser] = await db("users")
          .insert({
            email: "test@example.com",
            username: "Test User",
            balance: 1000,
          })
          .returning("*");
        user = newUser;
      }

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'dev-secret-key',
        { expiresIn: '1h' }
      );

      res.json({ token });
    } catch (error) {
      console.error('Dev login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

export default authRouter;