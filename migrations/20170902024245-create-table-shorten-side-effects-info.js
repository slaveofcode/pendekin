'use strict';

const TABLE_NAME = 'shorten_side_effect_infos'

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable(TABLE_NAME, {
      id: {
        type: Sequelize.UUID,
        defaultvalue: Sequelize.UUIDV4,
        primaryKey: true
      },
      shorten_side_effects_id: {
        type: Sequelize.UUID,
        references: {
          model: 'shorten_side_effects',
          key: 'id'
        },
        allowNull: true
      },
      request_payloads: Sequelize.JSON,
      response_content: Sequelize.JSON,
      run_at: Sequelize.DATE,
      finished_at: Sequelize.DATE,
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
        queryInterface.addIndex(TABLE_NAME, ['shorten_side_effects_id']),
        queryInterface.addIndex(TABLE_NAME, ['run_at']),
        queryInterface.addIndex(TABLE_NAME, ['finished_at']),
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
