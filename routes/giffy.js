const query = require('../mysql.conf.js')
const giffyRouter = require('express').Router()
const bcrypt = require("bcryptjs");
const saltRounds = 10;

const loggedInUsers = new Map(); // Store logged-in users in memory

setTimeout(() => {
  // Clear the loggedInUsers map every 10 minutes if their timestamp is older than 10 minutes
  const now = Date.now();
  for (const [key, value] of loggedInUsers.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) { // 10 minutes
      loggedInUsers.delete(key);
    }
  }
  console.log('Cleared loggedInUsers map');
}, 60_000);

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
      res.status().json({
        message: 'User created successfully',
        token: randomInt,
      })
    } else {
      res.status().json({ message: 'User creation failed' })
    }

  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
})



module.exports = giffyRouter