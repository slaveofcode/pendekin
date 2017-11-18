'use strict';

const RandomString = require('randomstring')

module.exports = function(sequelize, DataTypes) {
  var AuthClient = sequelize.define('AuthClient', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: DataTypes.STRING,
    client_key: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: () => {
        return RandomString.generate({ length: 50 })
      }
    },
    client_secret: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: () => {
        return RandomString.generate({ length: 100 })
      }
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE
  }, {
    tableName: 'auth_clients',
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
  return AuthClient;
};