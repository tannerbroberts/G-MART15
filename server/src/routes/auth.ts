import express, { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

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
  (req: Request, res: Response) => {
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
  }
);

// Status route using simple callback
authRouter.get('/status', (req: Request, res: Response) => {
  const isAuthenticated = req.isAuthenticated?.();
  
  if (isAuthenticated) {
    return res.json({ 
      isAuthenticated: true, 
      user: req.user 
    });
  } else {
    return res.json({ isAuthenticated: false });
  }
});

// Logout route using simple callback
authRouter.post('/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) { 
      return res.status(500).json({ message: 'Logout failed' }); 
    } else {
      return res.json({ message: 'Logged out successfully' });
    }
  });
});

export default authRouter;