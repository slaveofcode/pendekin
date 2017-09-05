'use strict'

const Routing = require('restify-routing')
const router = new Routing()

const apps = require(`${app_root}/apps`)

router.use('/', apps)

module.exports = router
