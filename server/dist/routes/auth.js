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
authRouter.get('/google/callback', passport_1.default.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    const authReq = req;
    if (!authReq.user) {
        return res.redirect('/login?error=authentication-failed');
    }
    const token = jsonwebtoken_1.default.sign({ id: authReq.user.id }, process.env.JWT_SECRET || 'dev-secret-key', { expiresIn: '1h' });
    const isProduction = process.env.NODE_ENV === 'production';
    const redirectUrl = isProduction
        ? `${process.env.FRONTEND_URL || 'https://your-frontend.vercel.app'}/auth/callback?token=${token}`
        : `http://localhost:5173/auth/callback?token=${token}`;
    res.redirect(redirectUrl);
});
// Status route using simple callback
authRouter.get('/status', (req, res) => {
    const isAuthenticated = req.isAuthenticated?.();
    if (isAuthenticated) {
        res.json({
            isAuthenticated: true,
            user: req.user
        });
    }
    else {
        res.json({ isAuthenticated: false });
    }
});
// Logout route using simple callback
authRouter.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            res.status(500).json({ message: 'Logout failed' });
        }
        else {
            res.json({ message: 'Logged out successfully' });
        }
    });
});
exports.default = authRouter;
