'use strict'

const server = require('../../server')
const supertest = require('supertest')
const chai = require('chai')
const DB = require(`${app_root}/models`)
const authClient = require('../utils/auth_client')

const expect = chai.expect
const request = () => (supertest(server))

describe('Category api\'s', () => {

  describe('List', () => {
    it('Should giving 401 response', async () => {
      const response = await supertest(server).get('/api/category')
      expect(response.statusCode).to.equal(401)
    })

    it('Should give category list', async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey()

      // create new category row
      const category = await DB.ShortenCategory.create({
        name: 'Book',
        description: 'Book Category'
      })

      const response = await supertest(server)
        .get('/api/category')
        .set('Authorization', `Basic ${authKey}`)
      const responseData = response.body
      expect(responseData.rows).to.have.length(1)
    })

    it('Should give a proper category list count', () => {
      // create 3  new category row
      // request http 
      // assertion
    })
  })

})