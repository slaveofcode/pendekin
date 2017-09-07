'use strict'

const Routing = require('restify-routing')
const RestifyError = require('restify-errors')
const Permission = require('../utils/permission')
const Joi = require(`${app_root}/libs/joi`);
const Pagination = require(`${app_root}/libs/pagination_parser`)
const DB = require(`${app_root}/models`)
const router = new Routing()

const pageExtractor = Pagination()
const schema = Joi.object().keys({
  name: Joi.string().trim().required()
})

router.get('/', Permission.BasicOrClient(), (req, res, next) => {
})

router.post('/', Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req

  try {
    const validatedParams = await Joi.validate(params, schema)
    const pageParams = pageExtractor(validatedParams)

    const client = await DB.AuthClient.create({
      name: validatedParams.name
    })
    
    res.send(client.toJSON())
    return next()
  } catch (err) {
    return next(err)
  }
})

router.put('/', Permission.BasicOrClient(), (req, res, next) => {

})

router.delete('/', Permission.BasicOrClient(), (req, res, next) => {

})

module.exports = router

/**
 * TODO: CRUD client
 */