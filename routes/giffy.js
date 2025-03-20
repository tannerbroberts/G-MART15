const query = require('../mysql.conf.js')
const giffyRouter = require('express').Router()

// CRUD operations for the Users of the Giffy ap
// Create
giffyRouter.post('/register', async (req, res) => {
  try {
    // 1. Get the data from the request body
    const {username, password} = req.body;

    // 2. Check if the user already exists
    const user = await query ('SELECT * FROM users WHERE username= ?', [username])

    // 3. Send a failure response if the user already exists
    if (user.length > 0) {
      return res.status(400).json({ message: 'User already exists' })
    }

    console.log('User does not exist')

    // 4. or continue
    // 5. Hash the password
    // 6. Generate a token
    // 5. Insert the new user into the database
    // await query('INSERT INTO users (username, password) VALUES (?, ?)',[username, password]);
    // 6. Send the success or failure response

    res.json({ message: 'Done' })
  } catch (err) {
    console.error(err)
    res.status(500).send('Server error')
  }
})
// // Read
// giffyRouter.get('/giffy/login', async (req, res) => {
//   try {
//     res.json({ message: 'Giffy app CRUD operations POST' })
//   } catch (err) {
//     console.error(err)
//     res.status(500).send('Server error')
//   }
// })
// giffyRouter.get('/giffy/favorites', async (req, res) => {
//   try {
//     res.json({ message: 'Giffy app CRUD operations POST' })
//   } catch (err) {
//     console.error(err)
//     res.status(500).send('Server error')
//   }
// })
// giffyRouter.get('/giffy/', async (req, res) => {
//   try {
//     res.json({ message: 'Giffy app CRUD operations GET' })
//   } catch (err) {
//     console.error(err)
//     res.status(500).send('Server error')
//   }
// })
// // Delete
// giffyRouter.delete('/giffy/unregister/:id', async (req, res) => {
//   try {
//     const { id } = req.params
    // await query('DELETE FROM giffy WHERE id = ?', [id])
//     res.json({ message: 'Giffy app CRUD operations DELETE' })
//   } catch (err) {
//     console.error(err)
//     res.status(500).send('Server error')
//   }
// })

module.exports = giffyRouter