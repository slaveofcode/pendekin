"use strict";

const redis = require(`${project_root}/redis`);
const randomatic = require("randomatic");

const redisClient = redis();
const SHORTEN_KEY = "SHORTEN";
/**
 * Get dummy random string
 * @param integer digits 
 */
const getUniqueCode = (digits = 6) => {
  return randomatic("aA0", digits);
};

/**
 * Check code on existing redis storage
 * @param string code 
 */
const checkUniqueCode = async code => {
  // checking code with digits
  return await redisClient.hgetallAsync(`${SHORTEN_KEY}:${code}`);
};

/**
 * Generate and checking code repeatedly until get the expected code
 * @param integer length 
 * @param string prefix 
 * @param string separator 
 */
const getSolidCode = (length = 6, prefix = null, separator = "-") => {
  // step1: generate code
  // step2: check code exist or not on redis
  // step3: if not: return the code
  // step4: if yes check the probability to generate new code,
  //          if still possible back to step1
  //          if not return error code with that length is now full
  //        else continue the process
  // step5: increment the total code count with given length
  // step6: return the code
};

module.exports = {
  getUniqueCode,
  checkUniqueCode,
  getSolidCode
};
