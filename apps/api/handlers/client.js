'use strict'

const Routing = require('restify-routing')
const Permission = require('../utils/permission')
const router = new Routing()


router.get('/', Permission.BasicOrClient(), (req, res, next) => {
  res.send({status: 'ok'})
  return next();
})


module.exports = router

/**
 * TODO: CRUD client
 */