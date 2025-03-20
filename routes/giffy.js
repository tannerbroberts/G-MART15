const query = require('../mysql.conf.js')
const giffyRouter = require('express').Router()

// CRUD operations for the Users of the Giffy ap
// Create
giffyRouter.post('/register', async (req, res) => {
  try {
    res.json({ message: 'Giffy app CRUD operations POST' })
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
//     await query('DELETE FROM giffy WHERE id = ?', [id])
//     res.json({ message: 'Giffy app CRUD operations DELETE' })
//   } catch (err) {
//     console.error(err)
//     res.status(500).send('Server error')
//   }
// })

module.exports = giffyRouter