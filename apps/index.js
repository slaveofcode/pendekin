'use strict'

const Routing = require('restify-routing')
const appRouter = new Routing()

const subRouter = new Routing()
subRouter.get('/', (req, res) => {
  res.send('Server is running...')
})

appRouter.use('/api', require('./api'))

module.exports = appRouter
