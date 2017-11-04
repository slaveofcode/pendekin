/**
 * All the configuration keys are refers into node_redis options here
 * https://github.com/NodeRedis/node_redis#options-object-properties
 * 
 * So if you didn't found what you need, you are free to add them by yourself
 * 
 */
const configurations = {
  development: {
    host: process.env.REDIS_HOST,
    port: process.env.PORT
  },
  staging: {
    host: process.env.REDIS_HOST,
    port: process.env.PORT
  },
  production: {
    host: process.env.REDIS_HOST,
    port: process.env.PORT
  }
};

module.exports = configurations[process.env.NODE_ENV || "development"];
