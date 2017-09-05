'use strict'

const passport = require('passport')
const Routing = require('restify-routing')
const router = new Routing()


router.get('/', 
  passport.authenticate('oauth2-client-password', { session: false }), 
  (req, res) => {
  res.send({status: 'ok'})
})

