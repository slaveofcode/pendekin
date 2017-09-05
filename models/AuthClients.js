'use strict';
module.exports = function(sequelize, DataTypes) {
  var AuthClients = sequelize.define('auth_clients', {
    id: DataTypes.UUID,
    name: DataTypes.STRING,
    client_key: DataTypes.STRING,
    client_secret: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE
  }, {
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return AuthClients;
};