'use strict'

const passport = require('passport')
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const DB = require(`${app_root}/models`)

const verifyClient = async (client_key, client_secret, done) => {
  try {

    const client = await new DB.AuthClient.findOne({
      where: {
        client_key,
        active: true
      }
    })

    console.log(client)

    if (!client) return done(null, false)

    if (client.get('client_secret') !== client_secret) return done(null, false)

    return done(null, client)
  } catch (error) {
    return done(error)
  }
}

passport.use(new ClientPasswordStrategy(verifyClient));

module.exports = passport
