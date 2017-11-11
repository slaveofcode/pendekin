"use strict";

const _ = require("lodash");
const moment = require("moment");
const ValidUrl = require("valid-url");
const DB = require(`${project_root}/models`);
const PasswordLib = require(`${project_root}/libs/password`);
const CodeGenerator = require(`${project_root}/libs/code_generator`);
const SolidCodeGenerator = require(`${project_root}/libs/fixed_code_generator`);
const siteConfig = require(`${config_root}/site`);

const PREFIX_SEPARATOR = "-";

const serializeObj = shortenCode => {
  const shortenJSON = !_.isPlainObject(shortenCode)
    ? shortenCode.toJSON()
    : shortenCode;

  let hasPassword = false;
  if (shortenJSON.protected_password)
    hasPassword = shortenJSON.protected_password.length > 0;

  const { code } = shortenJSON;

  const allowedValues = _.omit(shortenJSON, [
    "protected_password",
    "deleted_at"
  ]);

  return Object.assign(allowedValues, {
    code,
    has_password: hasPassword
  });
};

const serializeListObj = shortensArray => {
  return shortensArray.map(shorten => {
    return serializeObj(shorten);
  });
};

const isCodeAvailable = async codeToCheck => {
  // TODO: check to redis
  const shortenCode = await DB.ShortenUrl.findOne({
    where: {
      code: codeToCheck
    }
  });

  return _.isNull(shortenCode) ? false : true;
};

const normalizeExpiredTime = expired_at => {
  return _.isNil(expired_at) ? null : moment(expired_at);
};

const hashPassword = async password => {
  let protected_password = null;
  if (!_.isNil(password)) {
    protected_password = await PasswordLib.hashPassword(password);
  }

  return protected_password;
};

const normalizeCategory = async category_id => {
  let shorten_category_id = null;

  try {
    if (!_.isNil(category_id)) {
      const category = await DB.ShortenCategory.findOne({
        where: { id: { $eq: category_id } }
      });

      if (_.isNull(category)) return null;

      shorten_category_id = category.id;
    }
  } catch (err) {}

  return shorten_category_id;
};

const checkUrlValidity = url => {
  return ValidUrl.isHttpUri(url) || ValidUrl.isHttpsUri(url);
};

const validateCustomCode = async (custom_code, prefix) => {
  const codeToCheck = prefix
    ? `${prefix}${PREFIX_SEPARATOR}${custom_code}`
    : custom_code;
  if (await isCodeAvailable(codeToCheck)) return null;
  return codeToCheck;
};

const getCode = (length = 6, prefix) => {
  const code = CodeGenerator.generate(length);
  return prefix ? `${prefix}${PREFIX_SEPARATOR}${code}` : code;
};

const getShorten = async params => {
  const {
    prefix,
    password,
    expired_at,
    url,
    category_id,
    custom_code,
    parent_id
  } = params;

  /**
   * Checking URL validity
   */
  if (!checkUrlValidity(url)) return null;

  /**
   * Checking category
   */
  let shorten_category_id = null;
  if (!_.isNil(category_id)) {
    shorten_category_id = await normalizeCategory(category_id);
    if (_.isNull(shorten_category_id)) return null;
  }

  /**
   * Checking protected password
   */
  let protected_password = await hashPassword(password);

  let expiredTime = normalizeExpiredTime(expired_at);

  /**
   * Checking custom code
   */
  let customCode = null;
  if (!_.isNil(custom_code)) {
    customCode = await validateCustomCode(custom_code, prefix);
    if (customCode === null) return null;
  }

  const code = customCode ? customCode : getCode(6, prefix);

  return {
    expired_at: expiredTime,
    code,
    url,
    shorten_category_id,
    protected_password,
    parent_id
  };
};

module.exports = {
  serializeObj,
  serializeListObj,
  isCodeAvailable,
  normalizeExpiredTime,
  normalizeCategory,
  hashPassword,
  checkUrlValidity,
  getShorten,
  validateCustomCode,
  getCode
};
