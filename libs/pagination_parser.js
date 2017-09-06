'use strict'

const _ = require('lodash')

const LIMIT = 20
const MAX_LIMIT = 500

const getParamWithPageNumber = (pageNumber) => {
  pageNumber = parseInt(pageNumber)
  const pageParams = {
    offset: 0,
    limit: LIMIT
  }

  if (pageNumber <= 1)
    return pageParams

  Object.assign(pageParams, {
    offset: ((pageNumber - 1) * LIMIT) - 1
  })

  return pageParams
}

const getParamWithOffsetLimit = (offset = 0, limit = LIMIT) => {
  return {
    offset: (offset < 0) ? 0 : offset,
    limit: _.isNil(limit) || _.isNaN(limit) ? LIMIT : parseInt(limit)
  }
}

module.exports = (perPage = LIMIT) => {
  return (params) => {

    if (params.page) {
      return getParamWithPageNumber(params.page)
    }

    if (params.offset) {
      return getParamWithOffsetLimit(params.offset, params.limit)
    }

    return getParamWithPageNumber(1)

  }
}