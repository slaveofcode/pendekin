'use strict'

const _ = require('lodash')
const DB = require(`${app_root}/models`)

const getCompiledCode = (code, prefix, suffix) => {
  let compiledCode = code
  if (prefix)
    compiledCode = `${prefix}${compiledCode}`
  if (suffix)
    compiledCode = `${compiledCode}${suffix}`
  return compiledCode
}

const serializeObj = (shortenCode) => {
  const shortenJSON = shortenCode.toJSON()

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

const checkCodeAvailable = async (codeToCheck) => {
  const shortenCode = await DB.ShortenUrl.findOne({
    where: {
      code: codeToCheck
    }
  })

  return _.isNull(shortenCode) ? false : true
}

module.exports = {
  serializeObj,
  checkCodeAvailable,
  getCompiledCode
}