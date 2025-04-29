import express, { Router, Request, Response, RequestHandler } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const authRouter: Router = express.Router();

// Auth routes
authRouter.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

authRouter.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  ((req: Request, res: Response) => {
    const user = req.user as { id: number } | undefined;
    
    if (!user) {
      return res.redirect('/login?error=authentication-failed');
    }
    
    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET || 'dev-secret-key', 
      { expiresIn: '1h' }
    );

    const isProduction = process.env.NODE_ENV === 'production';
    const redirectUrl = isProduction
      ? `${process.env.FRONTEND_URL || 'https://your-frontend.vercel.app'}/auth/callback?token=${token}`
      : `http://localhost:5173/auth/callback?token=${token}`;
      
    res.redirect(redirectUrl);
  }) as RequestHandler
);

// Status route
authRouter.get('/status', ((req: Request, res: Response) => {
  const isAuthenticated = req.isAuthenticated?.();
  
  if (isAuthenticated) {
    return res.json({ 
      isAuthenticated: true, 
      user: req.user 
    });
  }
  return res.json({ isAuthenticated: false });
}) as RequestHandler);

// Logout route
authRouter.post('/logout', ((req: Request, res: Response) => {
  req.logout((err) => {
    if (err) { 
      return res.status(500).json({ message: 'Logout failed' }); 
    }
    return res.json({ message: 'Logged out successfully' });
  });
}) as RequestHandler);

export default authRouter;