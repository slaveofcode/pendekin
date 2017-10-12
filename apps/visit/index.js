'use strict'

const Routing = require('restify-routing')
const router = new Routing()


router.use('/', require('./visit_url'))
router.get('/render', (req, res, next) => {
  return res.render('index')
})

module.exports = router