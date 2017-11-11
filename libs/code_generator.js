"use strict";

const ShortId = require("shortid");
const HashIds = require("hashids");

const UNIQUE_SEED = 18;

/**
 * Generating unique code for key
 */
const uniqueCode = () => ShortId.seed(UNIQUE_SEED).generate();

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate code with length
 * Please take a note that the length is not guaranteed to be exact length 
 * as the given value. Based on the Hashids official docs says
 * "Note that ids are only padded to fit at least a certain length. 
 * It doesn't mean that your ids will be exactly that length."
 * @param {*} length 
 */
const generate = (length = 4) => {
  const hashid = new HashIds(uniqueCode(), length);
  return hashid.encode([
    getRandomInt(1, 1000),
    getRandomInt(1, 1000),
    getRandomInt(1, 1000),
    getRandomInt(1, 1000)
  ]);
};

/**
 * Generate bulk code with length
 * Please take a note that the length is not guaranteed to be exact length 
 * as the given value. Based on the Hashids official docs says
 * "Note that ids are only padded to fit at least a certain length. 
 * It doesn't mean that your ids will be exactly that length."
 * @param {*} count 
 * @param {*} length 
 */
const generateBulk = (count, length = 4) => {
  const codes = [];
  for (let i = 1; i <= count; i++) {
    codes.push(generate(length));
  }
  return codes;
};

module.exports = {
  uniqueCode,
  generate,
  generateBulk
};
