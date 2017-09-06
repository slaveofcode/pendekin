'use strict'

const passport = require('passport')
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy
const BasicStrategy = require('passport-http').BasicStrategy
const DB = require(`${app_root}/models`)
// const Logger = require(`${app_root}/logger`)
// const logger = Logger.getLogger(Logger.TYPES.PASSPORT)


const verifyClient = async (client_key, client_secret, done) => {
  try {

    const client = await DB.AuthClient.findOne({
      where: {
        client_key,
        active: true
      }
    })

    if (!client) return done(null, false)

    if (client.client_secret !== client_secret) return done(null, false)

    return done(null, client)
  } catch (error) {
    return done(error)
  }
}

passport.use(new ClientPasswordStrategy(verifyClient));
passport.use(new BasicStrategy(verifyClient))

module.exports = passport