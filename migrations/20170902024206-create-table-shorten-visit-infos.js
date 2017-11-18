'use strict';

const TABLE_NAME = 'shorten_visit_infos'

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
      referrer: Sequelize.STRING(512),
      ip_address: Sequelize.STRING,
      proxy: Sequelize.STRING,
      user_agent: Sequelize.STRING,
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
        queryInterface.addIndex(TABLE_NAME, ['referrer']),
        queryInterface.addIndex(TABLE_NAME, ['ip_address']),
        queryInterface.addIndex(TABLE_NAME, ['proxy']),
        queryInterface.addIndex(TABLE_NAME, ['user_agent']),
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
