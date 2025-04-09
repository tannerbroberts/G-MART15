const redirectRouter = require('express').Router()

redirectRouter.get('*', (_req, res) => res.redirect('/'))

module.exports = redirectRouter