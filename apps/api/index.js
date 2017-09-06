'use strict'

const Routing = require('restify-routing')
const router = new Routing()

router.use('/client', require('./handlers/client'))

module.exports = router
