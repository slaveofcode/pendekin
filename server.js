'use strict';

require('./global_var')

require('dotenv').config({
  path: '.env',
  encoding: 'utf8'
})

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const restify = require('restify')
const corsMiddleware = require('restify-cors-middleware')
const passport = require('./passport')
const routes = require('./routes')
const logger = require('./logger')

const server = restify.createServer({
  name: 'pendekin',
  version: '1.0.0',
  log: logger.getLoggerAdapter()
})

const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['http://api.myapp.com', 'http://web.myapp.com', '*'],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
})


server.pre(restify.pre.sanitizePath());
server.pre(cors.preflight)

server.use(restify.plugins.gzipResponse())
server.use(restify.plugins.jsonBodyParser({ mapParams: true }))
server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.queryParser({ mapParams: true }))
server.use(restify.plugins.fullResponse())
server.use(restify.plugins.conditionalRequest()) // ETag support 
server.use(cors.actual)
server.use(passport.initialize())
server.use(passport.session())

routes.applyRoutes(server)

module.exports = server