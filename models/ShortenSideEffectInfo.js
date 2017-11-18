'use strict'

module.exports = function (sequelize, DataTypes) {
  var ShortenSideEffectInfo = sequelize.define(
    'ShortenSideEffectInfo',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      shorten_side_effects_id: DataTypes.UUID,
      request_payloads: {
        type: DataTypes.JSON,
        allowNull: true
      },
      response_payload: {
        type: DataTypes.JSON,
        allowNull: true
      },
      run_at: DataTypes.DATE,
      finished_at: DataTypes.DATE,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE
    },
    {
      tableName: 'shorten_side_effect_infos',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      classMethods: {
        associate: function (models) {
          ShortenSideEffectInfo.belongsTo(models.ShortenSideEffect, { foreignKey: 'shorten_side_effects_id' })
        }
      }
    }
  )

  return ShortenSideEffectInfo
}
