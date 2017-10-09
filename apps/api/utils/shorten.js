'use strict'

const _ = require('lodash')

const serializeObj = (shortenCode) => {
  const shortenJSON = shortenCode.toJSON()

  const hasPassword = (shortenJSON.protected_password.length > 0)
  const { code, prefix, suffix } = shortenJSON
  
  const allowedValues = _.omit(shortenJSON, [
    'prefix',
    'suffix',
    'protected_password',
    'deleted_at'
  ])

  return Object.assign(allowedValues, {
    code: `${prefix}${code}${suffix}`,
    code_origin: code,
    hasPassword
  })
}

module.exports = {
  serializeObj
}