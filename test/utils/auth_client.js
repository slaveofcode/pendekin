"use strict";

const RandomString = require("randomstring");
const DB = require(`${project_root}/models`);
const UUIDV4 = require("uuid/v4");

const create = async () => {
  return DB.AuthClient.create({
    id: UUIDV4(),
    name: "WebApp",
    client_key: RandomString.generate({ length: 50 }),
    client_secret: RandomString.generate({ length: 100 }),
    active: true,
    created_at: new Date(),
    updated_at: new Date()
  });
};

const getAuthorizationKey = async () => {
  const authClient = await create();
  const encodedKey = new Buffer(
    `${authClient.client_key}:${authClient.client_secret}`
  ).toString("base64");
  return encodedKey;
};

module.exports = {
  create,
  getAuthorizationKey
};
