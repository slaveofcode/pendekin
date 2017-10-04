'use strict'

const DB = require(`${app_root}/models`)
const server = require('../server')

before(() => {
  // load env
  require('dotenv').config()

  // run server
  server.listen('1818');
})

beforeEach( async () => {
  await DB.sequelize.sync({ force: true })

})