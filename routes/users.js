const usersRouter = require('express').Router()
const postsJson = require('../json.json')

usersRouter.get('users/:userID', (req, res) => {
  const userID = parseInt(req.params.userID)
  const posts = postsJson.filter(user => user.id === userID)
  res.json(posts)
})

module.exports = usersRouter