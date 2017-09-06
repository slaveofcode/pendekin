'use strict'

const Routing = require('restify-routing')
const Permission = require('../utils/permission')
const Pagination = require(`${app_root}/libs/pagination_parser`)
const router = new Routing()

const pageExtractor = Pagination()

router.post('/', Permission.BasicOrClient(), (req, res, next) => {
  const { params } = req
  const pageParams = pageExtractor(params)
  
  res.send({status: 'ok'})
  return next();
})

router.post('/', Permission.BasicOrClient(), (req, res, next) => {

})

router.put('/', Permission.BasicOrClient(), (req, res, next) => {

})

router.delete('/', Permission.BasicOrClient(), (req, res, next) => {

})

module.exports = router

/**
 * TODO: CRUD client
 */