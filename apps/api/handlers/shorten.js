'use strict'

const _ = require('lodash')
const moment = require('moment')
const Routing = require('restify-routing')
const HttpStatus = require('http-status-codes')
const RestifyError = require('restify-errors')
const Moment = require('moment')
const Permission = require('../utils/permission')
const Shorten = require('../utils/shorten')
const Joi = require(`${app_root}/libs/joi`)
const DB = require(`${app_root}/models`)
const CodeGenerator = require(`${app_root}/libs/code_generator`)
const Pagination = require(`${app_root}/libs/pagination_parser`)

const router = new Routing()
const pageExtractor = Pagination.parser()

const schema = Joi.object().keys({
  url: Joi.string().trim().lowercase().required(),
  category_id: Joi.string(),
  prefix: Joi.string().trim().max(5),
  suffix: Joi.string().trim().max(5),
  password: Joi.string(),
  expired_at: Joi.date().iso(),
  custom_code: Joi.string()
})

const schemaEdit = Joi.object().keys({
  id: Joi.string().required(),
  url: Joi.string().trim().lowercase(),
  category_id: Joi.string(),
  password: Joi.string(),
  expired_at: Joi.date().iso(),
})

const schemaBulk = Joi.array().items(schema)

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

router.get('/:id', Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req

  try {
    const shorten = await DB.ShortenUrl.findOne({
      where: { id: { $eq: params.id } } 
    })

    if (_.isNull(shorten))
      res.send(RestifyError.NotFoundError('Item not found'))

    return res.send(HttpStatus.OK, Shorten.serializeObj(shorten))
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
    if (!Shorten.checkUrlValidity(url))
      return res.send(new RestifyError.BadRequestError('URL parameter is not valid'))

    /**
     * Checking category
     */
    let shorten_category_id = null
    if (!_.isNil(category_id)) {
      shorten_category_id = await Shorten.normalizeCategory(category_id)
      if (_.isNull(shorten_category_id))
        return res.send(new RestifyError.BadRequestError('Category not found'))
    }

    /**
     * Checking protected password
     */
    let protected_password = await Shorten.hashPassword(password)

    /**
     * Checking expired time
     */
    let expiredTime = Shorten.normalizeExpiredTime(expired_at)

    /**
     * Checking custom code
     */
    let customCode = null
    if (!_.isNil(custom_code)) {
      customCode = Shorten.getCompiledCode(custom_code, prefix, suffix)
      if (await Shorten.isCodeAvailable(customCode))
        return res.send(new RestifyError.BadRequestError('Custom Code already exist'))
    }

    const shorten = await DB.ShortenUrl.create({
      code: (customCode) ? customCode : CodeGenerator.generate(),
      expired_at: expiredTime,
      url,
      shorten_category_id,
      prefix,
      suffix,
      protected_password
    })

    return res.send(HttpStatus.CREATED, Shorten.serializeObj(shorten))
  } catch (err) {
    return next(err)
  }
})

router.post('/bulk', Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req

  try {
    const validatedBulkParams = await Joi.validate(params, schemaBulk)
    
    const bulkParams = []
    for (let shortenParam of validatedBulkParams) {
      bulkParams.push(await Shorten.validateShorten(shortenParam))
    }

    const shortens = await DB.ShortenUrl.bulkCreate(bulkParams)

    const statusCode = (bulkParams.length < validatedBulkParams.length) 
      ? HttpStatus.MULTI_STATUS 
      : HttpStatus.CREATED

    return res.send(statusCode, Shorten.serializeListObj(shortens))
  } catch (err) {
    return next(err)
  }
})

router.post('/check', Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req

  try {
    const schemaCheck = Joi.object().keys({ code: Joi.string() })
    const validatedParams = await Joi.validate(params, schemaCheck)
    const { 
      code
    } = validatedParams

    const available = await Shorten.isCodeAvailable(code)
    return res.send(available ? HttpStatus.CONFLICT : HttpStatus.NO_CONTENT)
  } catch (err) {
    return next(err)
  }
})

router.put('/:id', Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req

  try {
    const validatedParams = await Joi.validate(params, schemaEdit)
    const {
      id,
      url,
      password,
      category_id,
      expired_at
    } = validatedParams

    const shorten = await DB.ShortenUrl.findOne({
      where: { id: { $eq: id } } 
    })

    if (_.isNull(shorten))
      return res.send(new RestifyError.NotFoundError('Item could not be found'))
    
    const shortenUpdateParam = {}
    
    if (url) {
      if (!Shorten.checkUrlValidity(url))
        return res.send(new RestifyError.BadRequestError('URL parameter is not valid'))
      
      Object.assign(shortenUpdateParam, { url })
    }

    /**
     * Checking category
     */
    let shorten_category_id = null
    if (!_.isNil(category_id)) {
      shorten_category_id = await Shorten.normalizeCategory(category_id)
      if (_.isNull(shorten_category_id))
        return res.send(new RestifyError.BadRequestError('Category not found'))

      Object.assign(shortenUpdateParam, { shorten_category_id })
    }

    /**
     * Checking protected password
     */
    if (password) {
      let protected_password = await Shorten.hashPassword(password)
      Object.assign(shortenUpdateParam, { protected_password })
    }

    /**
     * Checking expired time
     */
    if (expired_at) {
      Object.assign(shortenUpdateParam, { expired_at: Shorten.normalizeExpiredTime(expired_at) })
    }
    
    await shorten.update(shortenUpdateParam)

    return res.send(HttpStatus.OK, Shorten.serializeObj(shorten))

  } catch (err) {
    return next(err)
  }
})

router.post('/index', Permission.BasicOrClient(), (req, res, next) => {

})

router.delete('/:id', Permission.BasicOrClient(), (req, res, next) => {

})

router.delete('/bulk', Permission.BasicOrClient(), (req, res, next) => {

})


module.exports = router
