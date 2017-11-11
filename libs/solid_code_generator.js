"use strict";

const redis = require(`${project_root}/redis`);
const randomatic = require("randomatic");

const redisClient = redis();
const SHORTEN_KEY = "SHORTEN";
/**
 * Get dummy random string
 * @param integer digits 
 */
const getCode = (digits = 6) => {
  return randomatic("aA0", digits);
};

/**
 * Check code on existing redis storage
 * @param string code 
 */
const isCodeExist = async code => {
  // checking code with digits
  const value = await redisClient.hgetallAsync(`${SHORTEN_KEY}:${code}`);
  return value !== null;
};

/**
 * Generate and checking code repeatedly until get the expected code
 * @param integer length 
 * @param string prefix 
 * @param string separator 
 */
const getSolidCode = async (
  length = 6,
  prefix = null,
  separator = "-",
  config = {}
) => {
  const cfg = Object.assign(
    { maxCheckTimes: 1000, throwOnFails: false },
    config
  );

  let code;
  const maxCheckTimes = cfg.maxCheckTimes;
  const checkCount = 0;

  do {
    code = prefix ? `${prefix}${separator}${getCode(length)}` : getCode(length);
  } while ((await isCodeExist(code)) && checkCount < maxCheckTimes);

  if (checkCount < maxCheckTimes) return code;
  if (cfg.throwOnFails)
    throw new Error("Code is not generated, most codes are already reseved");
  else return null;
};

module.exports = {
  getCode,
  isCodeExist,
  getSolidCode
};
