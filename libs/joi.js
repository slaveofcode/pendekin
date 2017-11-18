'use strict'

var Joi = require('joi')
var Promise = require('bluebird')

Joi.validateSync = Joi.validate
Joi.validate = Promise.promisify(Joi.validate)

module.exports = Joi
