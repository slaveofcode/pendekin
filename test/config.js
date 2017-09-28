'use strict'

const DB = require(`${app_root}/models`)


before(() => {
  // load env
  require('dotenv').config()
})

beforeEach( async () => {
  await DB.sequelize.sync({ force: true })
})