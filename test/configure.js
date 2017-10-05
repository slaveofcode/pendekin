'use strict'

const DB = require(`${app_root}/models`)
const server = require('../server')

before(() => {
  // before all test is started
  // load env
  require('dotenv').config()
})

after(() => {
  // after all tests is finished
})

beforeEach( async () => {
  

  // run server
  server.listen('1818')

  await DB.sequelize.sync({ force: true })
})

afterEach(() => {
  server.close()
})