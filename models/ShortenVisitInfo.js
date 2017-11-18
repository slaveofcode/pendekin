'use strict'

module.exports = function (sequelize, DataTypes) {
  var ShortenVisitInfos = sequelize.define(
    'ShortenVisitInfos',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      shorten_urls_id: DataTypes.UUID,
      referrer: {
        type: DataTypes.STRING,
        allowNull: true
      },
      ip_address: DataTypes.STRING,
      proxy: {
        type: DataTypes.STRING,
        allowNull: true
      },
      user_agent: DataTypes.STRING,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE
    },
    {
      tableName: 'shorten_visit_infos',
      timestamps: true,
      paranoid: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      classMethods: {
        associate: function (models) {
          ShortenVisitInfos.belongsTo(models.ShortenUrl, { foreignKey: 'shorten_urls_id' })
        }
      }
    }
  )

  return ShortenVisitInfos
}
