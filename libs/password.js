'use strict'

const bcrypt = require('bcryptjs')
const Promise = require('bluebird')

const genSalt = Promise.promisify(bcrypt.genSalt)
const hash = Promise.promisify(bcrypt.hash)

exports.hashPassword = async password => {
  const salt = await genSalt(10)
  return hash(password, salt)
}

exports.comparePassword = async (password, hashPassword) => {
  return bcrypt.compare(password, hashPassword)
}
