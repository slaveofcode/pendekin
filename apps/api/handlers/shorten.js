'use strict'

const _ = require('lodash')
const moment = require('moment')
const Routing = require('restify-routing')
const HttpStatus = require('http-status-codes')
const ValidUrl = require('valid-url')
const RestifyError = require('restify-errors')
const Moment = require('moment')
const Permission = require('../utils/permission')
const Shorten = require('../utils/shorten')
const Joi = require(`${app_root}/libs/joi`)
const DB = require(`${app_root}/models`)
const PasswordLib = require(`${app_root}/libs/password`)
const CodeGenerator = require(`${app_root}/libs/code_generator`)
const Pagination = require(`${app_root}/libs/pagination_parser`)

const router = new Routing()
const pageExtractor = Pagination.parser()

const schema = Joi.object().keys({
  url: Joi.string().trim().lowercase().required(),
  category_id: Joi.number(),
  prefix: Joi.string().trim().max(5),
  suffix: Joi.string().trim().max(5),
  password: Joi.string(),
  expired_at: Joi.date().iso(),
  custom_code: Joi.string()
})

router.get('/', Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req
  const pageParams = pageExtractor(params)

  try {
    const shortens = await DB.ShortenUrl.findAndCount(pageParams)
    return res.send({
      rows: shortens.rows,
      payload: Object.assign({
        count: shortens.count
      }, pageParams)
    })
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
      category_id,
      custom_code
    } = validatedParams

    /**
     * Checking URL validity
     */
    if (!ValidUrl.isHttpUri(url) && !ValidUrl.isHttpsUri(url))
      return res.send(new RestifyError.BadRequestError('URL parameter is not valid'))

    /**
     * Checking category
     */
    let shorten_category_id = null
    if (!_.isNil(category_id)) {
      const category = await DB.ShortenCategory.findOne({
        where: { id: { $eq: category_id } } 
      })

      if (!category)
        return res.send(new RestifyError.BadRequestError('Category not found'))

      shorten_category_id = category.id
    }

    /**
     * Checking protected password
     */
    let protected_password = null
    if (!_.isNil(password)) {
      protected_password = await PasswordLib.hashPassword(password)
    }

    /**
     * Checking expired time
     */
    let expiredTime = null
    if (!_.isNil(expired_at)) {
      expiredTime = (_.isNil(expired_at)) ? null : moment(expired_at)
    }

    /**
     * Checking custom code
     */
    if (!_.isNil(custom_code)) {
      if (await Shorten.checkCodeAvailable(custom_code))
        return res.send(new RestifyError.BadRequestError('Custom Code already exist'))
    }

    const shorten = await DB.ShortenUrl.create({
      code: (custom_code) ? custom_code : CodeGenerator.generate(),
      expired_at: expiredTime,
      url,
      shorten_category_id,
      prefix,
      suffix,
      protected_password
    })

    return res.send(HttpStatus.CREATED, Shorten.serializeObj(shorten))
  } catch (err) {
    console.log(err)
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
