'use strict'

module.exports = function(sequelize, DataTypes) {
  var AuthUser = sequelize.define('AuthUser', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    scopes: DataTypes.STRING,
    last_login: DataTypes.DATE,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE
  }, {
    tableName: 'auth_users',
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
  return AuthUser;
};