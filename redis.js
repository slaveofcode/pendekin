"use strict";

const redis = require("redis");
const promise = require("bluebird");

promise.promisifyAll(redis.RedisClient.prototype);
promise.promisifyAll(redis.Multi.prototype);

const getClient = () => {
  const redisClient = redis.createClient(require(`${config_root}/redis`));
  redisClient.on("error", err => {
    console.log("error redis: ", err);
  });
  return redisClient;
};

module.exports = getClient;
