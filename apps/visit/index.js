'use strict'

const Routing = require('restify-routing')
const router = new Routing()


router.use('/', require('./visit_url'))

module.exports = router