'use strict'

module.exports = function (sequelize, DataTypes) {
  var ShortenCategory = sequelize.define(
    'ShortenCategory',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      name: DataTypes.STRING,
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE
    },
    {
      tableName: 'shorten_categories',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      classMethods: {
        associate: function (models) {
          // associations can be defined here
        }
      }
    }
  )

  return ShortenCategory
}
