const todosRouter = require('express').Router()
const query = require('../mysql.conf.js')

todosRouter.get('/todos', (_req, res) => {
  // get the todos from the todos schema in the todos table
  query('SELECT * FROM todos')
    .then((results) => {
      // Send the results back to the client
      res.json(results)
    })
    .catch((error) => {
      console.error('Error fetching todos:', error)
      res.status(500).json({ error: 'Internal server error' })
    })
})

module.exports = todosRouter