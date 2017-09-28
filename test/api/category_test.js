'use strict'

const server = require('../../server')
const request = require('supertest')(server)
const chai = require('chai')
const DB = require(`${app_root}/models`)

const expect = chai.expect

describe('Category api\'s', () => {

  describe('Category list', () => {
    it('Should giving 401 response', async () => {
      const response = await request.get('/api/category')
      expect(response.statusCode).to.equal(401)
    })

    it('Should give category list', async () => {
      // create new category row
      const category = await DB.ShortenCategory.create({
        name: 'Book',
        description: 'Book Category'
      })

      const response = await request
        .get('/api/category')
        .set({
          'Authorization': 'Basic NzAxaXlnOEFseWNZRlV5endVVDBpQnRTbWUwWWxoVktCNld4WkRZd3BtekZhdlhnNGQ6MkVhRmRUY0VNSjFKZzZ1ZGNscnZWNnQ2ZVZVeHFjb2JkRTJwZWx4UklZVXN5c1pjekQwTlRwRmhwU2FSSDhpcFNHQTc2ZWZDc1pRWnZpVWVBYk9lUTUwdm5reGRyZ0pDSGZoSA=='
        })
      const responseData = response.body
      console.log(response)
      expect(responseData.rows).to.have.length(1)
    })

    it('Should give a proper category list count', () => {
      // create 3  new category row
      // request http 
      // assertion
    })
  })

})