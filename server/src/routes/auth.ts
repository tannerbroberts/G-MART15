import express, { Router, Request, Response, RequestHandler, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

// Define AuthRequest interface for type safety
interface AuthRequest extends Request {
  user?: { id: number };
}

const authRouter: Router = express.Router();

// Auth routes
authRouter.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

authRouter.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  // Fix: Properly type the callback function so TypeScript knows it returns void
  ((req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      
      if (!authReq.user) {
        res.redirect('/login?error=authentication-failed');
        return;
      }
      
      const token = jwt.sign(
        { id: authReq.user.id }, 
        process.env.JWT_SECRET || 'dev-secret-key', 
        { expiresIn: '1h' }
      );

      const isProduction = process.env.NODE_ENV === 'production';
      
      // In production, both frontend and backend are on the same domain
      // So we can use a relative path for the redirect
      const redirectUrl = isProduction
        ? `/auth/callback?token=${token}` // Same domain in production
        : `http://localhost:5173/auth/callback?token=${token}`; // Separate domains in dev
        
      console.log(`Redirecting to: ${redirectUrl}`);
      res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }) as express.RequestHandler
);

// Status route with error handling
authRouter.get('/status', ((req: Request, res: Response, next: NextFunction) => {
  try {
    const isAuthenticated = req.isAuthenticated?.();
    
    if (isAuthenticated) {
      res.json({ 
        isAuthenticated: true, 
        user: req.user 
      });
      return;
    } else {
      res.json({ isAuthenticated: false });
      return;
    }
  } catch (error) {
    next(error);
  }
}) as express.RequestHandler);

// Logout route with error handling
authRouter.post('/logout', ((req: Request, res: Response, next: NextFunction) => {
  try {
    req.logout((err) => {
      if (err) { 
        res.status(500).json({ message: 'Logout failed' });
      } else {
        res.json({ message: 'Logged out successfully' });
      }
    });
  } catch (error) {
    next(error);
  }
}) as express.RequestHandler);

export default authRouter;