'use strict'

const Routing = require('restify-routing')
const appRouter = new Routing()

appRouter.get('/', (req, res, next) => {
  res.send({
    status: 200,
    msg: 'Server is running...'
  })
  return next()
})

appRouter.use('/api', require('./api'))

module.exports = appRouter
