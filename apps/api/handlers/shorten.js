'use strict'

const _ = require('lodash')
const Routing = require('restify-routing')
const HttpStatus = require('http-status-codes')
const ValidUrl = require('valid-url')
const RestifyError = require('restify-errors')
const Moment = require('moment')
const Permission = require('../utils/permission')
const Joi = require(`${app_root}/libs/joi`)
const DB = require(`${app_root}/models`)
const PasswordLib = require(`${app_root}/libs/password`)
const CodeGenerator = require(`${app_root}/libs/code_generator`)
const Pagination = require(`${app_root}/libs/pagination_parser`)

const router = new Routing()
const pageExtractor = Pagination.parser()

const schema = Joi.object().keys({
  url: Joi.string().trim().lowercase().required(),
  category_id: Joi.number().optional(),
  prefix: Joi.string().trim().max(5).optional(),
  suffix: Joi.string().trim().max(5).optional(),
  password: Joi.string().optional(),
  expired_at: Joi.date().iso().optional()
})

router.get('/', Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req
  const pageParams = pageExtractor(params)

  try {
    const shortens = await DB.ShortenUrl.findAndCount(pageParams)
    res.send({
      rows: shortens.rows,
      payload: Object.assign({
        count: shortens.count
      }, pageParams)
    })
    return next(err)
  } catch (err) {
    return next(err)
  }
})

router.post('/', Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req

  try {
    const validatedParams = await Joi.validate(params, schema)
    const { 
      suffix, 
      prefix, 
      password, 
      expired_at, 
      url, 
      category_id } = validatedParams

    if (!ValidUrl.isHttpUri(url) && !ValidUrl.isHttpsUri(url))
      return res.send(new RestifyError.BadRequestError('URL parameter is not valid'))

    let shorten_category_id = null
    if (!_.isNil(category_id)) {
      const category = await DB.ShortenCategory.findOne({
        where: { id: { $eq: category_id } } 
      })

      if (!category)
        return res.send(new RestifyError.BadRequestError('Category not found'))

      shorten_category_id = category.id
    }

    let protected_password = null
    if (!_.isNil(password)) {
      protected_password = await PasswordLib.hashPassword(password)
    }

    let expiredTime = null
    if (!_.isNil(expired_at)) {
      expiredTime = (_.isNil(expired_at)) ? null : moment(expired_at)
    }

    const shorten = await DB.ShortenUrl.create({
      code: CodeGenerator.generate(),
      expired_at: expiredTime,
      url,
      shorten_category_id,
      prefix,
      suffix,
      protected_password
    })

    res.send(shorten)
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
