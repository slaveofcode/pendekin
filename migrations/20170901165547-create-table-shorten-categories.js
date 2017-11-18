'use strict';

const TABLE_NAME = 'shorten_categories'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(TABLE_NAME, {
      id: {
        type: Sequelize.UUID,
        defaultvalue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: Sequelize.STRING,
      description: Sequelize.TEXT,
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    }, {
      schema: 'public'
    })
    .then(() => {
      return Promise.all([
        queryInterface.addIndex(TABLE_NAME, ['name']),
        queryInterface.addIndex(TABLE_NAME, ['created_at']),
        queryInterface.addIndex(TABLE_NAME, ['updated_at']),
        queryInterface.addIndex(TABLE_NAME, ['deleted_at'])
      ])
    })
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable(TABLE_NAME);
  }
};
