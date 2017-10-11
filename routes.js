'use strict'

const restify = require('restify')
const Routing = require('restify-routing')
const router = new Routing()

const apps = require(`${app_root}/apps`)

router.use('/', apps)

router.get(
  /\/assets\/(.*)?.*/,
  restify.plugins.serveStatic({
    directory: `${app_root}/static`,
    appendRequestPath: false,
    default: 'index.html'
  })
)


module.exports = router
