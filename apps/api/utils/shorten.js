"use strict";

const _ = require("lodash");
const moment = require("moment");
const ValidUrl = require("valid-url");
const RestifyError = require("restify-errors");
const DB = require(`${project_root}/models`);
const PasswordLib = require(`${project_root}/libs/password`);
const CodeGenerator = require(`${project_root}/libs/code_generator`);
const SolidCodeGenerator = require(`${project_root}/libs/fixed_code_generator`);
const siteConfig = require(`${config_root}/site`);
const redis = require(`${project_root}/redis`);

const PREFIX_SEPARATOR = "-";
const SHORTEN_KEY = siteConfig.redis_shorten_key || "SHORTEN";

const redisClient = siteConfig.enable_redis ? redis() : null;

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
  let shortenCode;
  if (siteConfig.enable_redis) {
    shortenCode = await redisClient.hgetallAsync(
      `${SHORTEN_KEY}:${codeToCheck}`
    );
  } else {
    shortenCode = await DB.ShortenUrl.findOne({
      where: {
        code: codeToCheck
      }
    });
  }
  return _.isNull(shortenCode) ? false : true;
};

const isURLAvailable = async urlToCheck => {
  let shortenCode;
  if (siteConfig.enable_redis) {
    shortenCode = await redisClient.hgetallAsync(
      `${SHORTEN_KEY}:${codeToCheck}`
    );
  } else {
    shortenCode = await DB.ShortenUrl.findOne({
      where: {
        url: urlToCheck
      }
    });
  }
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

const getCode = (length = siteConfig.shorten_length_code, prefix) => {
  const code = CodeGenerator.generate(length);
  return prefix ? `${prefix}${PREFIX_SEPARATOR}${code}` : code;
};

const reuseExisting = async url => {
  if (siteConfig.enable_redis) {
    const existing = await redisClient.sinterAsync(
      `${siteConfig.redis_shorten_key}:URL:${url}`
    );
    return _.isArray(existing) && existing.length > 0
      ? await redisClient.hgetallAsync(existing[0])
      : null;
  } else {
    return await DB.ShortenUrl.findOne({
      where: {
        url: { $eq: url }
      }
    });
  }
};

const getShorten = async params => {
  const {
    prefix,
    password,
    expired_at,
    url,
    category_id,
    custom_code,
    parent_id,
    auto_removed: is_auto_remove_on_visited,
    is_index: is_index_urls,
    throwOnError
  } = params;

  const isThrowing = _.isNil(throwOnError) ? true : throwOnError;

  /**
   * Checking URL validity
   */
  if (!checkUrlValidity(url) && !is_index_urls)
    return isThrowing
      ? new RestifyError.BadRequestError("URL parameter is not valid")
      : null;

  /**
   * Checking category
   */
  let shorten_category_id = null;
  if (!_.isNil(category_id)) {
    shorten_category_id = await normalizeCategory(category_id);
    if (_.isNull(shorten_category_id))
      return isThrowing
        ? new RestifyError.BadRequestError("Category not found")
        : null;
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
    if (customCode === null)
      return isThrowing
        ? new RestifyError.BadRequestError("Custom Code already exist")
        : null;
  }

  const code = customCode
    ? customCode
    : getCode(siteConfig.shorten_length_code, prefix);

  const responseObj = {
    expired_at: expiredTime,
    code,
    url,
    shorten_category_id,
    protected_password,
    parent_id
  };

  if (is_auto_remove_on_visited) {
    Object.assign(responseObj, { is_auto_remove_on_visited });
  }

  if (is_index_urls) {
    Object.assign(responseObj, { is_index_urls });
  }

  return responseObj;
};

const saveShorten = async shortenCodeParam => {
  if (_.isArray(shortenCodeParam)) {
    const shortens = await DB.ShortenUrl.bulkCreate(shortenCodeParam);

    if (siteConfig.enable_redis) {
      const redisClient = redis();
      for (shortened of shortens) {
        /**
         * Save index to track existing shortened code by url
         * the pattern will look like this
         * SHORTEN:URL:<url-to-index> -> SHORTEN:<shorten-code>
         */
        redisClient.sadd(
          `${siteConfig.redis_shorten_key}:URL:${shortened.url}`,
          `${siteConfig.redis_shorten_key}:${shortened.code}`
        );
      }
    }
    return shortens;
  } else {
    const shorten = await DB.ShortenUrl.create(shortenCodeParam);
    if (siteConfig.enable_redis) {
      /**
       * Save index to track existing shortened code by url
       * the pattern will look like this
       * SHORTEN:URL:<url-to-index> -> SHORTEN:<shorten-code>
       */
      redisClient.sadd(
        `${siteConfig.redis_shorten_key}:URL:${shorten.url}`,
        `${siteConfig.redis_shorten_key}:${shorten.code}`
      );
    }
    return shorten;
  }
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
  getCode,
  saveShorten,
  reuseExisting
};
