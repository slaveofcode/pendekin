'use strict'

const passport = require('passport')
const Routing = require('restify-routing')
const router = new Routing()


router.get('/', 
  passport.authenticate(['oauth2-client-password'], { session: false }), 
  (req, res, next) => {
  res.send({status: 'ok'})
  return next();
})


module.exports = router
