'use strict'

const _ = require('lodash')
const moment = require('moment')
const ValidUrl = require('valid-url')
const DB = require(`${app_root}/models`)
const PasswordLib = require(`${app_root}/libs/password`)

const getCompiledCode = (code, prefix, suffix) => {
  let compiledCode = code
  if (prefix)
    compiledCode = `${prefix}${compiledCode}`
  if (suffix)
    compiledCode = `${compiledCode}${suffix}`
  return compiledCode
}

const serializeObj = (shortenCode) => {

  const shortenJSON = (!_.isPlainObject(shortenCode)) 
    ? shortenCode.toJSON() 
    : shortenCode
  
  let hasPassword = false
  if (shortenJSON.protected_password)
    hasPassword = (shortenJSON.protected_password.length > 0)

  const { code, prefix, suffix } = shortenJSON
  
  const allowedValues = _.omit(shortenJSON, [
    'prefix',
    'suffix',
    'protected_password',
    'deleted_at'
  ])

  return Object.assign(allowedValues, {
    code: getCompiledCode(code, prefix, suffix),
    code_origin: code,
    has_password: hasPassword
  })
}

const serializeListObj = (shortensArray) => {
  return shortensArray.map((shorten) => {
    return serializeObj(shorten)
  })
}


const isCodeAvailable = async (codeToCheck) => {
  const shortenCode = await DB.ShortenUrl.findOne({
    where: {
      code: codeToCheck
    }
  })

  return _.isNull(shortenCode) ? false : true
}

const normalizeExpiredTime = (expired_at) => {
  let expiredTime = null
  if (!_.isNil(expired_at)) {
    expiredTime = (_.isNil(expired_at)) ? null : moment(expired_at)
  }
  return expiredTime
}

const hashPassword = async (password) => {
  let protected_password = null
  if (!_.isNil(password)) {
    protected_password = await PasswordLib.hashPassword(password)
  }

  return protected_password
}

const normalizeCategory = async (category_id) => {
  let shorten_category_id = null

  try {
    if (!_.isNil(category_id)) {
      const category = await DB.ShortenCategory.findOne({
        where: { id: { $eq: category_id } } 
      })

      return null

      shorten_category_id = category.id
    }
  } catch (err) {

  }

  return shorten_category_id
}

const checkUrlValidity = (url) => {
  return ValidUrl.isHttpUri(url) || ValidUrl.isHttpsUri(url)
}

module.exports = {
  serializeObj,
  serializeListObj,
  isCodeAvailable,
  getCompiledCode,
  normalizeExpiredTime,
  normalizeCategory,
  hashPassword,
  checkUrlValidity
}