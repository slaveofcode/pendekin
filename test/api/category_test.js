'use strict'

const chai = require('chai')
const faker = require('faker')
const DB = require(`${app_root}/models`)
const request = require('../utils/request')
const authClient = require('../utils/auth_client')

const expect = chai.expect

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

  describe('Detail', () => {
    it('Should get correct Category', async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey()

      const CATEGORY_NAME = faker.lorem.words(4)
      const CATEGORY_DESC = faker.lorem.sentence(10)
      const category = await DB.ShortenCategory.create({
        name: CATEGORY_NAME,
        description: CATEGORY_DESC
      })

      const response = await request.get(`/api/category/${category.id}`, {
        headers: {'Authorization': `Basic ${authKey}`}
      })

      const categoryObj = response.data
      expect(categoryObj.id).to.be.a('string')
      expect(categoryObj.id).to.equal(category.id)
      expect(categoryObj.name).to.equal(CATEGORY_NAME)
      expect(categoryObj.description).to.equal(CATEGORY_DESC)

    })
  })

  describe('Create', () => {
    it('Should create a new Category', async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey()

      const CATEGORY_NAME = faker.lorem.words(4)
      const CATEGORY_DESC = faker.lorem.sentence(10)

      const response = await request.post(`/api/category`, {
          name: CATEGORY_NAME,
          description: CATEGORY_DESC
        },
        {
          headers: {
            'Authorization': `Basic ${authKey}`
          }
        })

      const categoryObj = response.data
      console.log(categoryObj)
      expect(response.status).to.equal(201)
      expect(categoryObj.name).to.equal(CATEGORY_NAME)
      expect(categoryObj.description).to.equal(CATEGORY_DESC)
    })
  })

  describe('Delete', () => {})

})