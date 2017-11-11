"use strict";

const TABLE_NAME = "shorten_urls";

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface
      .createTable(
        TABLE_NAME,
        {
          id: {
            type: Sequelize.UUID,
            defaultvalue: Sequelize.UUIDV4,
            primaryKey: true
          },
          shorten_category_id: {
            type: Sequelize.UUID,
            references: {
              model: "shorten_categories",
              key: "id"
            }
          },
          code: {
            type: Sequelize.STRING(15),
            unique: true,
            allowNull: false
          },
          protected_password: {
            type: Sequelize.STRING,
            allowNull: true
          },
          parent_id: {
            type: Sequelize.UUID,
            references: {
              model: TABLE_NAME,
              key: "id"
            },
            allowNull: true
          },
          url: {
            type: Sequelize.STRING(512),
            allowNull: false
          },
          is_index_urls: {
            type: Sequelize.BOOLEAN,
            defaultvalue: false
          },
          is_auto_remove_on_visited: {
            type: Sequelize.BOOLEAN,
            defaultvalue: false
          },
          expired_at: {
            type: Sequelize.DATE,
            allowNull: true
          },
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
        },
        {
          schema: "public"
        }
      )
      .then(() => {
        return Promise.all([
          queryInterface.addIndex(TABLE_NAME, ["shorten_category_id"]),
          queryInterface.addIndex(TABLE_NAME, ["code"]),
          queryInterface.addIndex(TABLE_NAME, ["protected_password"]),
          queryInterface.addIndex(TABLE_NAME, ["parent_id"]),
          queryInterface.addIndex(TABLE_NAME, ["is_index_urls"]),
          queryInterface.addIndex(TABLE_NAME, ["is_auto_remove_on_visited"]),
          queryInterface.addIndex(TABLE_NAME, ["expired_at"]),
          queryInterface.addIndex(TABLE_NAME, ["created_at"]),
          queryInterface.addIndex(TABLE_NAME, ["updated_at"]),
          queryInterface.addIndex(TABLE_NAME, ["deleted_at"])
        ]);
      });
  },

  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable(TABLE_NAME);
  }
};
