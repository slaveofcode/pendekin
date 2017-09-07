'use strict'

module.exports = function (sequelize, DataTypes) {
  var ShortenSideEffect = sequelize.define(
    'ShortenSideEffect',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      shorten_urls_id: DataTypes.UUID,
      type: DataTypes.STRING,
      payloads: {
        type: DataTypes.JSON,
        allowNull: true
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE
    },
    {
      tableName: 'shorten_side_effects',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      classMethods: {
        associate: function (models) {
          ShortenSideEffect.belongsTo(models.ShortenUrl, { foreignKey: 'shorten_urls_id' })
        }
      }
    }
  )

  return ShortenSideEffect
}
