'use strict'

const DB = require(`${app_root}/models`)
const server = require('../server')

before(() => {
  // before all test is started
})

after(() => {
  // after all tests is finished
})

beforeEach( async () => {
  // load env
  require('dotenv').config()

  // run server
  server.listen('1818')

  await DB.sequelize.sync({ force: true })
})

afterEach(() => {
  server.close()
})