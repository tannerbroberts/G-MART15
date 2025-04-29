"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authRouter = express_1.default.Router();
// Auth routes
authRouter.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/google/callback', passport_1.default.authenticate('google', { failureRedirect: '/' }), ((req, res) => {
    const user = req.user;
    if (!user) {
        res.redirect('/login?error=authentication-failed');
        return;
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '1h' });
    const isProduction = process.env.NODE_ENV === 'production';
    // In production, both frontend and backend are on the same domain
    // So we can use a relative path for the redirect
    const redirectUrl = isProduction
        ? `/auth/callback?token=${token}` // Same domain in production
        : `http://localhost:5173/auth/callback?token=${token}`; // Separate domains in dev
    console.log(`Redirecting to: ${redirectUrl}`);
    res.redirect(redirectUrl);
}));
// Status route
authRouter.get('/status', ((req, res) => {
    const isAuthenticated = req.isAuthenticated?.();
    if (isAuthenticated) {
        res.json({
            isAuthenticated: true,
            user: req.user
        });
        return;
    }
    res.json({ isAuthenticated: false });
}));
// Logout route
authRouter.post('/logout', ((req, res) => {
    req.logout((err) => {
        if (err) {
            res.status(500).json({ message: 'Logout failed' });
            return;
        }
        res.json({ message: 'Logged out successfully' });
    });
}));
exports.default = authRouter;
