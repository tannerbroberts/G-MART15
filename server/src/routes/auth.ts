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
      res.redirect('/login?error=authentication-failed');
      return;
    }
    
    const token = jwt.sign(
      { id: user.id }, 
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
  }) as RequestHandler
);

// Status route
authRouter.get('/status', ((req: Request, res: Response) => {
  const isAuthenticated = req.isAuthenticated?.();
  
  if (isAuthenticated) {
    res.json({ 
      isAuthenticated: true, 
      user: req.user 
    });
    return;
  }
  res.json({ isAuthenticated: false });
}) as RequestHandler);

// Logout route
authRouter.post('/logout', ((req: Request, res: Response) => {
  req.logout((err) => {
    if (err) { 
      res.status(500).json({ message: 'Logout failed' });
      return;
    }
    res.json({ message: 'Logged out successfully' });
  });
}) as RequestHandler);

export default authRouter;