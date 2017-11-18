'use strict'

const Routing = require('restify-routing')
const router = new Routing()

router.use('/client', require('./handlers/client'))
router.use('/category', require('./handlers/category'))
router.use('/shorten', require('./handlers/shorten'))

module.exports = router
