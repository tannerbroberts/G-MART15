const query = require('../mysql.conf.js')
const giffyRouter = require('express').Router()
const bcrypt = require("bcryptjs");

// Login stuff
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const saltRounds = 10;

const loggedInUsers = new Map(); // Store logged-in users in memory
loggedInUsers.set(7, { username: 'testuser', timestamp: Date.now() });
// CRUD operations for the Users of the Giffy app
// Create
giffyRouter.post('/register', async (req, res) => {
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
    const randomInt = Math.floor(Math.random() * 1_000_000_000_000);
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
// Read routes are giffyRouter.get...
// Delete and Update routes are giffyRouter.post...
// Test in postman
// Test in the browser
// Make sure your SQL server is running
// Make sure your SQL schema matches process.env.DB_DATABASE
// Create the schema and tables using MySqlWorkbench

// Ryan's Assignment:
// Not create branches that exist like that name ever again, who let him create that name?
// Read the user's favorites
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

// Maggie's assignment:
// Add a single favorite to the user's favorites
giffyRouter.post('/addFavorite', async (req, res) => {
  try {
    const { userId, gifUrl } = req.body;
    const result = await query(
      'INSERT INTO favorites (user_id, gif_url) VALUES (?, ?)',
      [userId, gifUrl]
    );
    if (result.affectedRows === 1) {
      console.log("Added to Favorites");
      res.status(201).json({ message: "Added to Favorites" });
    } else {
      console.log("Error adding to Favorites");
      res.status(400).json({ message: "Error adding to Favorites" });
    }
  } catch (err) {
    console.error("Error adding to Favorites:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Maggie credit:
// Add a batch of favorites to the user's favorites
giffyRouter.post('/addBatchFavorites', async (req, res) => {
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

// Ali's assignment:
// Delete the user's favorites

// Ali credit:
// Delete the user's account

// Ryan credit:
// Log out
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
// Georgia credit:
// delete a single favorite from the user's favorites
giffyRouter.post('/delFavorite', async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    const result = await query(
      'DELETE FROM favorites (user_id, item_id) VALUES (?, ?)',
      [userId, itemId]
    );
    if (result.affectedRows === 1) {
      console.log("Removed from Favorites");
      res.status(201).json({ message: "Removed from Favorites" });
    } else {
      console.log("Error removing from Favorites");
      res.status(400).json({ message: "Error removing from Favorites" });
    }
  } catch (err) {
    console.error("Error removing from Favorites:", err);
    res.status(500).json({ message: "Server error" });
  }

})
// Georgia credit:
// Delete a batch of favorites from the user's favorites

giffyRouter.post('/delBatchFavorites', async (req, res) => {
  try {
    const { userId, itemIds } = req.body;
    const values = itemIds.map(itemId => [userId, itemId]);
    const result = await query(
      'DELETE FROM favorites (user_id, item_id) VALUES ?',
      [values]
    );

    if (result.affectedRows === itemIds.length) {
      console.log("Removed batch from Favorites");
      res.status(201).json({ message: "Removed batch from Favorites" });
    } else {
      console.log("Error removing batch from Favorites");
      res.status(400).json({ message: "Error removing batch from Favorites" });
    }
  } catch (err) {
    console.error("Error removing batch from Favorites:", err);
    res.status(500).json({ message: "Server error" });
  }
});




// Maggie credit:
// Add a batch of favorites to the user's favorites

module.exports = giffyRouter