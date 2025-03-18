const postDataRouter = require('express').Router()

postDataRouter.post('/data', (_req, res) => {
  console.log('Received data:', _req.body)
})

module.exports = postDataRouter