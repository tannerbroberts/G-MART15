const query = require('../../../mysql.conf.js')
const giffyRouter = require('express').Router()
const bcrypt = require("bcryptjs");

// Login stuff
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const saltRounds = 10;

const loggedInUsers = new Map(); // Store logged-in users in memory
loggedInUsers.set(7, { username: 'testuser', timestamp: Date.now() });

/**
 * giffy/login (post)
 * giffy/logout (post)
 * giffy/register (post)
 * giffy/deleteAccount (delete)
 * giffy/favorites (get)
 * giffy/favorites (post)
 * giffy/favorites (delete)
 */

giffyRouter.post('/login', async (req, res) => {
  // TODO
});

giffyRouter.post('/logout', (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(400).json({message: 'No token provided'});
    }
    const tokenNum = parseInt(token);
    if (loggedInUsers.has(tokenNum)) {
      loggedInUsers.delete(tokenNum);
      res.json({ message: 'Logged out successfully'});
    } else {
      res.status(404).json({message: 'User not found, or already logged out'});
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({message: 'Logout failed'});
  }
});

giffyRouter.post('/register', async (req, res) => {

  // TODO: Hash the password
  try {
    // 1. Get the data from the request body
    const { username, password } = req.body;

    // 2 Check if the data is valid
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' })
    }

    // 3. Check if the user already exists
    const user = await query ('SELECT * FROM users WHERE username= ?', [username])

    // 4. Send a failure response if the user already exists
    if (user.length > 0) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // 5. Hash the password
    const hash = bcrypt.hashSync(password, saltRounds);

    // 6. Generate a token
    makeToken();
    loggedInUsers.set(randomInt, { username, timestamp: Date.now() });
    // 7. Insert the new user into the database
    const responseToInsertion = await query('INSERT INTO users (username, password) VALUES (?, ?)',[username, password]);

    // 8. Send the success or failure response
    if (responseToInsertion.affectedRows === 1) {
      res.status(201).json({
        message: 'User created successfully',
        token: randomInt,
      })
    } else {
      res.status(201).json({ message: 'User creation failed' })
    }

  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
})

giffyRouter.delete('/deleteAccount', async (req, res) => {
  // TODO
})

giffyRouter.get('/favorites', async (req, res) => {
  try {
    const userId = 1;

    const favorites = await query(
      'SELECT * FROM user_favorites WHERE user_id = ?',
      [userId]
    );

    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve favorites' });
  }
});

giffyRouter.post('/favorites', async (req, res) => {
  try {
    const { userId, gifUrls } = req.body;
    const values = gifUrls.map(gifUrl => [userId, gifUrl]);
    const result = await query(
      'INSERT INTO favorites (user_id, gif_url) VALUES ?',
      [values]
    );

    if (result.affectedRows === gifUrls.length) {
      console.log("Added batch to Favorites");
      res.status(201).json({ message: "Added batch to Favorites" });
    } else {
      console.log("Error adding batch to Favorites");
      res.status(400).json({ message: "Error adding batch to Favorites" });
    }
  } catch (err) {
    console.error("Error adding batch to Favorites:", err);
    res.status(500).json({ message: "Server error" });
  }
});

giffyRouter.delete('/favorites', async (req, res) => {
  try {
    const { userId, gifUrls } = req.body;
    const values = gifUrls.map(gifUrl => [userId, gifUrl]);
    const result = await query(
      'DELETE FROM favorites (user_id, gif_url) VALUES ?',
      [values]
    );

    if (result.affectedRows === gifUrls.length) {
      console.log("Removed batch from Favorites");
      res.status(200).json({ message: "Removed batch from Favorites" });
    } else {
      console.log("Error removing batch from Favorites");
      res.status(409).json({ message: "Error removing batch from Favorites" });
    }
  } catch (err) {
    console.error("Error removing batch from Favorites:", err);
    res.status(500).json({ message: "Server error" });
  }
});

function makeToken() {
  return Math.floor(Math.random() * 1_000_000_000_000);
}

module.exports = giffyRouter