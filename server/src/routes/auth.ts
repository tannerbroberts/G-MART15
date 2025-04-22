import express from 'express';
import passport from 'passport';
import { query } from '../utils/db';

const router = express.Router();

// Rate limiting for table creation
const tableCreationLimiter = new Map<number, { count: number, timestamp: number }>();

// Google authentication route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback route
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Check if the user has set a username
    const user = req.user as any;
    if (user && user.username && user.username === user.email.split('@')[0].substring(0, 20)) {
      // Username is still the default one, redirect to choose username
      res.redirect('/set-username');
    } else {
      // Username already set, redirect to home
      res.redirect('/');
    }
  }
);

// Check authentication status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user as any;
    res.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        balance: user.balance
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Logout route
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Update username
router.post('/update-username', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'You must be logged in to update your username' });
  }
  
  const { username } = req.body;
  const userId = (req.user as any).id;
  
  // Validate username
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ message: 'Invalid username' });
  }
  
  if (username.length > 20) {
    return res.status(400).json({ message: 'Username must be 20 characters or less' });
  }
  
  // Filter inappropriate names (simple check, expand as needed)
  const inappropriateWords = ['admin', 'root', 'moderator', 'fuck', 'shit', 'ass', 'dick'];
  if (inappropriateWords.some(word => username.toLowerCase().includes(word))) {
    return res.status(400).json({ message: 'Username contains inappropriate content' });
  }
  
  try {
    // Check if username already exists
    const existingUser = await query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, userId]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'Username already taken' });
    }
    
    // Update username
    await query('UPDATE users SET username = $1 WHERE id = $2', [username, userId]);
    res.json({ success: true, message: 'Username updated successfully' });
  } catch (error) {
    console.error('Error updating username:', error);
    res.status(500).json({ message: 'Failed to update username' });
  }
});

// Check if username is available
router.get('/check-username/:username', async (req, res) => {
  const { username } = req.params;
  
  try {
    const existingUser = await query('SELECT id FROM users WHERE username = $1', [username]);
    res.json({ available: existingUser.rows.length === 0 });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ message: 'Failed to check username' });
  }
});

// Create or join table
router.post('/tables', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'You must be logged in' });
  }
  
  const { tableId } = req.body;
  const user = req.user as any;
  
  // Validate table ID
  if (!tableId || typeof tableId !== 'string') {
    return res.status(400).json({ message: 'Invalid table ID' });
  }
  
  if (tableId.length > 20) {
    return res.status(400).json({ message: 'Table ID must be 20 characters or less' });
  }
  
  try {
    // Check rate limiting for table creation
    if (!tableCreationLimiter.has(user.id)) {
      tableCreationLimiter.set(user.id, { count: 0, timestamp: Date.now() });
    }
    
    const userLimiter = tableCreationLimiter.get(user.id)!;
    const oneMinuteAgo = Date.now() - 60000;
    
    // Reset counter if it's been more than a minute
    if (userLimiter.timestamp < oneMinuteAgo) {
      userLimiter.count = 0;
      userLimiter.timestamp = Date.now();
    }
    
    // Check if existing table
    const existingTable = await query('SELECT * FROM game_tables WHERE table_id = $1', [tableId]);
    
    if (existingTable.rows.length === 0) {
      // Check rate limit before creating new table
      if (userLimiter.count >= 3) {
        const secondsLeft = Math.ceil((userLimiter.timestamp + 60000 - Date.now()) / 1000);
        return res.status(429).json({
          message: 'Rate limit exceeded',
          secondsLeft
        });
      }
      
      // Create new table
      userLimiter.count++;
      const newTable = await query(
        'INSERT INTO game_tables (table_id, created_by) VALUES ($1, $2) RETURNING *',
        [tableId, user.id]
      );
      
      // Add user to table
      await query(
        'INSERT INTO players_tables (user_id, table_id, seat_position) VALUES ($1, $2, $3)',
        [user.id, newTable.rows[0].id, 0]
      );
      
      res.status(201).json({
        message: 'Table created successfully',
        table: newTable.rows[0]
      });
    } else {
      // Table exists, check if it's full
      const players = await query(
        'SELECT * FROM players_tables WHERE table_id = $1',
        [existingTable.rows[0].id]
      );
      
      if (players.rows.length >= 6) {
        return res.status(409).json({ message: 'Table is full' });
      }
      
      // Check if user is already at table
      const existingPlayer = players.rows.find(p => p.user_id === user.id);
      if (existingPlayer) {
        return res.json({
          message: 'Already joined this table',
          table: existingTable.rows[0]
        });
      }
      
      // Join table
      await query(
        'INSERT INTO players_tables (user_id, table_id, seat_position) VALUES ($1, $2, $3)',
        [user.id, existingTable.rows[0].id, players.rows.length]
      );
      
      res.json({
        message: 'Table joined successfully',
        table: existingTable.rows[0]
      });
    }
  } catch (error) {
    console.error('Error creating/joining table:', error);
    res.status(500).json({ message: 'Failed to create/join table' });
  }
});

export default router;