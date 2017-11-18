'use strict'

const chai = require('chai')
const pagination_parser = require('../../libs/pagination_parser')

const expect = chai.expect
const assert = chai.assert

const getOffsetNormalLimit = (pageNumber) => {
  return pageNumber <= 1 ? 0 : ((pageNumber - 1) * pagination_parser.LIMIT)
}
const getOffsetCustomLimit = (pageNumber, limit) => {
  return pageNumber <= 1 ? 0 : ((pageNumber - 1) * limit)
}

describe('Pagination Parser', () => {

  describe('getParamWithPageNumber', () => {
    it('Should have an offset and limit', () => {
      const pageOne = 1
      const pagingParams = pagination_parser.getParamWithPageNumber(pageOne)
      expect(pagingParams).to.have.property('offset', 0)
      expect(pagingParams).to.have.property('limit', pagination_parser.LIMIT)

      const pageTwo = 2
      const pagingParams2 = pagination_parser.getParamWithPageNumber(pageTwo)
      expect(pagingParams2).to.have.property('offset', 20)
      expect(pagingParams2).to.have.property('limit', pagination_parser.LIMIT)
    })

    it('Should have an Number value for both offset and limit', () => {
      const pageOne = 1
      const pagingParams = pagination_parser.getParamWithPageNumber(pageOne)
      expect(pagingParams.offset).to.be.a('number')
      expect(pagingParams.limit).to.be.a('number')

      const pageTwo = 2
      const pagingParams2 = pagination_parser.getParamWithPageNumber(pageTwo)
      expect(pagingParams2.offset).to.be.a('number')
      expect(pagingParams2.limit).to.be.a('number')
    })

    it('Should return right offset number if pageNumber is given', () => {

      const pageOne = 5
      const pagingParams = pagination_parser.getParamWithPageNumber(pageOne)
      expect(pagingParams).to.have.property('offset', getOffsetNormalLimit(pageOne))

      const pageTwo = 56
      const pagingParams2 = pagination_parser.getParamWithPageNumber(pageTwo)
      expect(pagingParams2).to.have.property('offset',  getOffsetNormalLimit(pageTwo))

      const pageThree = 77
      const pagingParams3 = pagination_parser.getParamWithPageNumber(pageThree)
      expect(pagingParams3).to.have.property('offset',  getOffsetNormalLimit(pageThree))

      const pageFour = 26
      const pagingParams4 = pagination_parser.getParamWithPageNumber(pageFour)
      expect(pagingParams4).to.have.property('offset',  getOffsetNormalLimit(pageFour))
    })
  })

  describe('getParamWithPageNumber', () => {
    it('Should have default value for offset and limit', () => {
      const pagingParams = pagination_parser.getParamWithOffsetLimit()
      expect(pagingParams).to.have.property('offset', 0)
      expect(pagingParams).to.have.property('limit', pagination_parser.LIMIT)
    })

    it('Should give right type for offset and limit', () => {
      const pagingParams = pagination_parser.getParamWithOffsetLimit()
      expect(pagingParams.offset).to.be.a('number')
      expect(pagingParams.limit).to.be.a('number')
    })

    it('Should give right value for offset and limit', () => {
      const pagingParams = pagination_parser.getParamWithOffsetLimit(0, 250)
      expect(pagingParams).to.have.property('offset', 0)
      expect(pagingParams).to.have.property('limit', 250)

      const pagingParams2 = pagination_parser.getParamWithOffsetLimit(0, 550)
      expect(pagingParams2).to.have.property('offset', 0)
      expect(pagingParams2).to.have.property('limit', pagination_parser.MAX_LIMIT)

      const pagingParams3 = pagination_parser.getParamWithOffsetLimit(26, 550)
      expect(pagingParams3).to.have.property('offset', 26)
      expect(pagingParams3).to.have.property('limit', pagination_parser.MAX_LIMIT)
    })
  })

  describe('parser', () => {
    it('Should return default value for offset and limit', () => {
      const parser = pagination_parser.parser()
      const pagingParams = parser()

      expect(pagingParams).to.have.property('offset', 0)
      expect(pagingParams).to.have.property('limit', pagination_parser.LIMIT)
      expect(pagingParams.offset).to.be.a('number')
      expect(pagingParams.limit).to.be.a('number')
    })

    it('Should give right value based on page params', () => {
      const limit = 25
      const parser = pagination_parser.parser(limit)

      const pagingParams = parser({ page: 1 })
      expect(pagingParams).to.have.property('offset', getOffsetCustomLimit(1, limit))
      expect(pagingParams).to.have.property('limit', limit)
      
      const pagingParams2 = parser({ page: 3 })
      expect(pagingParams2).to.have.property('offset', getOffsetCustomLimit(3, limit))
      expect(pagingParams2).to.have.property('limit', limit)

      const parser2 = pagination_parser.parser()
      const pagingParams3 = parser2({ page: 6 })
      expect(pagingParams3).to.have.property('offset', getOffsetNormalLimit(6))
      expect(pagingParams3).to.have.property('limit', pagination_parser.LIMIT)
    })

    it('Should give right value based on offset params', () => {
      const limit = 25
      const parser = pagination_parser.parser(limit)

      const pagingParams = parser({ offset: 0 })
      expect(pagingParams).to.have.property('offset', 0)
      expect(pagingParams).to.have.property('limit', limit)
      
      const pagingParams2 = parser({ offset: 36, limit: 50 })
      expect(pagingParams2).to.have.property('offset', 36)
      expect(pagingParams2).to.have.property('limit', 50)

      const parser2 = pagination_parser.parser()
      const pagingParams3 = parser2({ offset: 18 })
      expect(pagingParams3).to.have.property('offset', 18)
      expect(pagingParams3).to.have.property('limit', pagination_parser.LIMIT)
    })

  })

})