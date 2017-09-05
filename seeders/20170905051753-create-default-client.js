'use strict';

const RandomString = require('randomstring')
const UUIDV4 = require('uuid/v4')

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('auth_clients', [{
      id: UUIDV4(),
      name: 'WebApp',
      client_key: RandomString.generate({ length: 50 }),
      client_secret: RandomString.generate({ length: 100 }),
      active: true,
      created_at: new Date(),
      updated_at: new Date()
    }], {})
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('auth_clients', null, {})
  }
};
