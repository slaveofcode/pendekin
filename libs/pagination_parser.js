'use strict'

const _ = require('lodash')

const LIMIT = 20
const MAX_LIMIT = 500

const getParamWithPageNumber = (pageNumber, limit = LIMIT) => {
  pageNumber = parseInt(pageNumber)
  const pageParams = {
    offset: 0,
    limit: limit
  }

  if (pageNumber <= 1)
    return pageParams

  Object.assign(pageParams, {
    offset: ((pageNumber - 1) * limit) - 1
  })

  return pageParams
}

const getParamWithOffsetLimit = (offset = 0, limit = LIMIT) => {
  return {
    offset: (offset < 0) ? 0 : offset,
    limit: _.isNil(limit) || _.isNaN(limit) ? LIMIT : (parseInt(limit) > MAX_LIMIT ? MAX_LIMIT : parseInt(limit))
  }
}

const parser = (perPage = LIMIT) => {
  return params => {
    if (params && params.page) {
      return getParamWithPageNumber(params.page, perPage)
    }

    if (params && !_.isNil(params.offset)) {
      const chosenLimit = params.limit ? params.limit : perPage
      return getParamWithOffsetLimit(params.offset, chosenLimit)
    }

    return getParamWithPageNumber(1)
  }
}


module.exports = {
  LIMIT,
  MAX_LIMIT,
  getParamWithPageNumber,
  getParamWithOffsetLimit,
  parser
}