const query = require('../mysql.conf.js')
const postDataRouter = require('express').Router()

postDataRouter.post('/data', (req, res) => {
  console.log('Received data:', _req.body)
  const { user_id } = req.body

  // Make a request to the mySQL database for all the todos for the user
  query('SELECT * FROM todos WHERE user_id = ?', user_id)
    .then((results) => {
      // Send the results back to the client
      res.json(results)
    })
    .catch((error) => {
      console.error('Error fetching todos:', error)
      res.status(500).json({ error: 'Internal server error' })
    })
})

module.exports = postDataRouter