'use strict'

const chai = require('chai')
const pagination_parser = require('../../libs/pagination_parser')

const expect = chai.expect
const assert = chai.assert


describe('Pagination Parser', () => {

  describe('getParamWithPageNumber', () => {
    it('Should have an offset and limit', () => {
      const pageOne = 1
      const pagingParams = pagination_parser.getParamWithPageNumber(pageOne)
      expect(pagingParams).to.have.property('offset', 0)
      expect(pagingParams).to.have.property('limit', pagination_parser.LIMIT)

      const pageTwo = 2
      const pagingParams2 = pagination_parser.getParamWithPageNumber(pageTwo)
      expect(pagingParams2).to.have.property('offset', 19)
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

      const getOffset = (pageNumber) => (((pageNumber - 1) * pagination_parser.LIMIT) - 1)

      const pageOne = 5
      const pagingParams = pagination_parser.getParamWithPageNumber(pageOne)
      expect(pagingParams).to.have.property('offset', getOffset(pageOne))

      const pageTwo = 56
      const pagingParams2 = pagination_parser.getParamWithPageNumber(pageTwo)
      expect(pagingParams2).to.have.property('offset',  getOffset(pageTwo))

      const pageThree = 77
      const pagingParams3 = pagination_parser.getParamWithPageNumber(pageThree)
      expect(pagingParams3).to.have.property('offset',  getOffset(pageThree))

      const pageFour = 26
      const pagingParams4 = pagination_parser.getParamWithPageNumber(pageFour)
      expect(pagingParams4).to.have.property('offset',  getOffset(pageFour))
    })
  })

  describe('getParamWithPageNumber', () => {

  })

  describe('parser', () => {

  })

})