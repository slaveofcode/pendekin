'use stric'

const passport = require('passport')

const Basic = (useSession = false) => {
  return passport.authenticate('basic', { session: useSession })
}

const BasicOrClient = (useSession = false) => {
  return passport.authenticate([
    'basic', 
    'oauth2-client-password'
  ], { session: useSession })
}

const Client = (useSession = false) => {
  return passport.authenticate('oauth2-client-password', { session: useSession })
}

module.exports = {
  Basic,
  Client,
  BasicOrClient
}