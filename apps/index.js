'use strict'

const siteConfig = require(`${app_root}/config/site`)
const Routing = require('restify-routing')
const appRouter = new Routing()

appRouter.get('/healthy', (req, res, next) => {
  res.send({
    status: 200,
    msg: 'Server is running...'
  })
  return next()
})

/**
 * Api 
 */
appRouter.use('/api', require('./api'))

/**
 * Visit url
 */
appRouter.use(`/${siteConfig.visit_url_path}`, require('./visit'))

module.exports = appRouter
