'use strict'

// const server = require('../../server')
// const request = require('supertest')(server)
const chai = require('chai')
const DB = require(`${app_root}/models`)
const request = require('../utils/request')
const authClient = require('../utils/auth_client')

const expect = chai.expect
const assert = chai.assert

describe('Category api\'s', () => {

  describe('List', () => {
    it('Should giving 401 response', async () => {
      const response = await request.get('/api/category')
      expect(response.status).to.equal(401)
    })

    it('Should give category list', async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey()

      // create new category row
      const category = await DB.ShortenCategory.create({
        name: 'Book',
        description: 'Book Category'
      })

      const response = await request.get('/api/category', { 
        headers: {'Authorization': `Basic ${authKey}`} 
      })

      const responseData = response.data
      expect(responseData.rows).to.have.length(1)
    })

    it('Should give a proper category list count', async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey()
      
      // create 3  new category row
      const category = await DB.ShortenCategory.bulkCreate([
        {
          name: 'Book 1',
          description: 'Book Category'
        },
        {
          name: 'Book 2',
          description: 'Book Category'
        },
        {
          name: 'Book 3',
          description: 'Book Category'
        }
      ])

      const response = await request.get('/api/category', { 
        headers: {'Authorization': `Basic ${authKey}`} 
      })

      const responseData = response.data
      expect(responseData.rows).to.have.length(3)
    })
  })

})