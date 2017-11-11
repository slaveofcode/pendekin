"use strict";
require("dotenv").config();

const Promise = require("bluebird");
const DB = require(`${project_root}/models`);
const redis = require(`${project_root}/redis`);
const server = require("../server");

const redisClient = redis();

before(() => {
  // load env
  require("dotenv").config();
});

after(() => {
  // after all tests is finished
});

beforeEach(async () => {
  await DB.sequelize.sync({ force: true });
  await server.listen("1818");
  redisClient.flushall();
});

afterEach(async () => {
  await new Promise((resolve, reject) => {
    server.close(err => {
      if (err) return reject(err);
      resolve();
    });
  });
});
