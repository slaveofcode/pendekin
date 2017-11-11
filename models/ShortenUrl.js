"use strict";

module.exports = function(sequelize, DataTypes) {
  var ShortenUrl = sequelize.define(
    "ShortenUrl",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true
        // references: { model: "ShortenUrl", key: "id" }
      },
      shorten_category_id: DataTypes.UUID,
      code: DataTypes.STRING,
      protected_password: {
        type: DataTypes.STRING,
        allowNull: true
      },
      url: DataTypes.STRING,
      is_index_urls: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      is_auto_remove_on_visited: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      expired_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE
    },
    {
      tableName: "shorten_urls",
      timestamps: true,
      paranoid: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      classMethods: {
        associate: function(models) {
          ShortenUrl.belongsTo(models.ShortenCategory, {
            foreignKey: "shorten_category_id"
          });
          ShortenUrl.hasMany(models.ShortenUrl, {
            as: "ChildrenUrl",
            foreignKey: "parent_id"
          });
          ShortenUrl.hasMany(models.ShortenSideEffect);
        }
      }
    }
  );

  return ShortenUrl;
};
