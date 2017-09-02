'use strict';

const TABLE_NAME = 'shorten_side_effects'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(TABLE_NAME, {
      id: {
        type: Sequelize.UUID,
        defaultvalue: Sequelize.UUIDV4,
        primaryKey: true
      },
      shorten_urls_id: {
        type: Sequelize.UUID,
        references: {
          model: 'shorten_urls',
          key: 'id'
        },
        allowNull: true
      },
      type: Sequelize.STRING,
      payloads: Sequelize.JSON,
      active: Sequelize.BOOLEAN,
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
        queryInterface.addIndex(TABLE_NAME, ['shorten_urls_id']),
        queryInterface.addIndex(TABLE_NAME, ['type']),
        queryInterface.addIndex(TABLE_NAME, ['active']),
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
