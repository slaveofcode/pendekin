'use strict'

const _ = require('lodash')
const Routing = require('restify-routing')
const HttpStatus = require('http-status-codes')
const ValidUrl = require('valid-url')
const RestifyError = require('restify-errors')
const Permission = require('../utils/permission')
const Joi = require(`${app_root}/libs/joi`)
const DB = require(`${app_root}/models`)

const router = new Routing()

const schema = Joi.object().keys({
  url: Joi.string().trim().lowercase().required(),
  category_id: Joi.number().optional(),
  prefix: Joi.string().trim().max(5).optional(),
  suffix: Joi.string().trim().max(5).optional(),
  password: Joi.string().optional(),
  expired_at: Joi.date().iso().optional()
})

router.post('/', Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req

  try {
    const validatedParams = await Joi.validate(params, schema)

    if (!ValidUrl.isUri(validatedParams.url))
      return res.send(new RestifyError.BadRequestError())

    return next()
  } catch (err) {
    return next(err)
  }
})

router.post('/bulk', Permission.BasicOrClient(), (req, res, next) => {

})

router.post('/check', Permission.BasicOrClient(), (req, res, next) => {

})

router.put('/:id', Permission.BasicOrClient(), (req, res, next) => {

})

router.delete('/:id', Permission.BasicOrClient(), (req, res, next) => {

})

router.delete('/bulk', Permission.BasicOrClient(), (req, res, next) => {

})


module.exports = router
