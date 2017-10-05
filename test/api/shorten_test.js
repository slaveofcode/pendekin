'use strict'

const chai = require('chai')
const faker = require('faker')
const DB = require(`${app_root}/models`)
const CodeGenerator = require(`${app_root}/libs/code_generator`)
const Pagination = require(`${app_root}/libs/pagination_parser`)
const request = require('../utils/request')
const authClient = require('../utils/auth_client')

const expect = chai.expect


describe('Shorten api\'s', () => {
  describe('List', () => {
    it('Should giving 401 response', async () => {
      const response = await request.get('/api/shorten')
      expect(response.status).to.equal(401)
    })

    it('Should be able to get all shorteners', async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey()

      await DB.ShortenUrl.create({
        code: CodeGenerator.generate(),
        expired_at: faker.date.future(2018),
        url: faker.internet.url(),
        prefix: faker.random.word(),
        suffix: faker.random.word(),
        protected_password: faker.internet.password()
      })

      const response = await request.get('/api/shorten', { 
        headers: {'Authorization': `Basic ${authKey}`} 
      })

      const responseData = response.data
      expect(responseData.rows).to.have.length(1)
      
      const payload = responseData.payload
      expect(payload.count).to.equal(1)
      expect(payload.offset).to.equal(0)
      expect(payload.limit).to.equal(Pagination.LIMIT)
    })

    it('Should be able to get paginated shorteners', async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey()

      const shortens = []
      for (let i = 0; i <= 24; i++) { // 25 items
        shortens.push({
          code: CodeGenerator.generate(),
          expired_at: faker.date.future(2018),
          url: faker.internet.url(),
          prefix: faker.random.word(),
          suffix: faker.random.word(),
          protected_password: faker.internet.password()
        })
      }

      await DB.ShortenUrl.bulkCreate(shortens)

      const responsePageOne = await request.get('/api/shorten', { 
        headers: {'Authorization': `Basic ${authKey}`},
        params: { page: 1 }
      })


      const responseDataOne = responsePageOne.data
      expect(responseDataOne.rows).to.have.length(20)
      
      const payloadOne = responseDataOne.payload
      expect(payloadOne.count).to.equal(25)
      expect(payloadOne.offset).to.equal(0)
      expect(payloadOne.limit).to.equal(Pagination.LIMIT)

      // const responsePageTwo = await request.get('/api/shorten', { 
      //   headers: {'Authorization': `Basic ${authKey}`},
      //   params: { page: 2 }
      // })
      
      // const responseDataTwo = responsePageTwo.data
      // expect(responseDataTwo.rows).to.have.length(1)
      
      // const payloadTwo = responseDataTwo.payload
      // expect(payloadTwo.count).to.equal(21)
      // expect(payloadTwo.offset).to.equal(19)
      // expect(payloadTwo.limit).to.equal(Pagination.LIMIT)
    })
  })

  describe('Create', () => {
    it('Should be able to create one shortener', () => {})
    it('Should be able to create one shortener with custom code', () => {})
    it('Should be able to create one shortener with prefix code', () => {})
    it('Should be able to create one shortener with suffix code', () => {})
    it('Should be able to create one shortener with prefix and suffix code', () => {})
    it('Should be able to create bulk shorteners', () => {})
    it('Should be able to create bulk shorteners with custom, prefix and suffix code', () => {})
  })

  describe('Check', () => {
    it('Should be able to check custom shortener code', () => {})
  })

  describe('Edit', () => {
    it('Should be able to edit shortener item', () => {})
    it('Should not be able to change expired shortener item', () => {})
  })

  describe('Detail', () => {
    it('Should get corrent shortener item', () => {})
  })

  describe('Delete', () => {
    it('Should remove shortener item', () => {})
    it('Should remove bulk of shorteners', () => {})
  })
})

