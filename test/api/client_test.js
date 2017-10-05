'use strict'

const chai = require('chai')
const faker = require('faker')
const UUIDV4 = require('uuid/v4')
const RandomString = require('randomstring')
const DB = require(`${app_root}/models`)
const request = require('../utils/request')
const authClient = require('../utils/auth_client')

const expect = chai.expect

describe('Client api\'s', () => {
  describe('List', () => {

    it('Should giving 401 response', async () => {
      const response = await request.get('/api/client')
      expect(response.status).to.equal(401)
    })

    it('Should give client list', async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey()

      // create new category row
      const category = await DB.AuthClient.create({
        id: UUIDV4(),
        name: faker.lorem.words(3),
        client_key: RandomString.generate({ length: 10 }),
        client_secret: RandomString.generate({ length: 25 })
      })

      const response = await request.get('/api/client', { 
        headers: {'Authorization': `Basic ${authKey}`} 
      })

      const responseData = response.data

      // because we had create 1 client before, 
      // so now the client count would be 2
      expect(responseData.rows).to.have.length(2)
    })

    it('Should give a proper client list count', async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey()
      
      // create 3 new category row
      await DB.AuthClient.bulkCreate([
        {
          id: UUIDV4(),
          name: faker.lorem.words(3),
          client_key: RandomString.generate({ length: 10 }),
          client_secret: RandomString.generate({ length: 25 })
        },
        {
          id: UUIDV4(),
          name: faker.lorem.words(4),
          client_key: RandomString.generate({ length: 10 }),
          client_secret: RandomString.generate({ length: 25 })
        },
        {
          id: UUIDV4(),
          name: faker.lorem.words(2),
          client_key: RandomString.generate({ length: 10 }),
          client_secret: RandomString.generate({ length: 25 })
        }
      ])

      const response = await request.get('/api/client', { 
        headers: {'Authorization': `Basic ${authKey}`} 
      })

      const responseData = response.data

      // because we had create 1 client before, 
      // so now the client count would be 4
      expect(responseData.rows).to.have.length(4)
    })

  })

  describe('Edit', () => {
    it('Should be able to change client', async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey()

      const CLIENT_NAME = faker.lorem.words(4)
      const CLIENT_KEY = RandomString.generate({ length: 10 })
      const CLIENT_SECRET = RandomString.generate({ length: 25 })
      const client = await DB.AuthClient.create({
        name: CLIENT_NAME,
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET
      })

      const response = await request.put(`/api/client/${client.id}`, 
        {
          name: faker.lorem.words(3),
          client_key: RandomString.generate({ length: 10 }),
          client_secret: RandomString.generate({ length: 25 })
        },
        {
          headers: {'Authorization': `Basic ${authKey}`}
        })

      const clientObj = response.data
      expect(clientObj.id).to.equal(client.id)
      expect(clientObj.name).to.not.equal(CLIENT_NAME)
      expect(clientObj.client_key).to.not.equal(CLIENT_KEY)
      expect(clientObj.client_secret).to.not.equal(CLIENT_SECRET)

    })
  })

  describe('Detail', () => {
    it('Should get correct Client', async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey()

      const CLIENT_NAME = faker.lorem.words(4)
      const CLIENT_KEY = RandomString.generate({ length: 10 })
      const CLIENT_SECRET = RandomString.generate({ length: 25 })
      const client = await DB.AuthClient.create({
        name: CLIENT_NAME,
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET
      })

      const response = await request.get(`/api/client/${client.id}`, {
        headers: {'Authorization': `Basic ${authKey}`}
      })

      const clientObj = response.data
      expect(clientObj.id).to.be.a('string')
      expect(clientObj.id).to.equal(client.id)
      expect(clientObj.client_key).to.equal(CLIENT_KEY)
      expect(clientObj.client_secret).to.equal(CLIENT_SECRET)
    })
  })

  describe('Create', () => {
    it('Should create a new Client', async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey()

      const CLIENT_NAME = faker.lorem.words(4)
      const CLIENT_KEY = RandomString.generate({ length: 10 })
      const CLIENT_SECRET = RandomString.generate({ length: 25 })

      const response = await request.post('/api/client', {
          name: CLIENT_NAME,
          client_key: CLIENT_KEY,
          client_secret: CLIENT_SECRET
        },
        {
          headers: {
            'Authorization': `Basic ${authKey}`
          }
        })

      const clientObj = response.data
      expect(response.status).to.equal(201)
      expect(clientObj.name).to.equal(CLIENT_NAME)
      expect(clientObj.client_key).to.equal(CLIENT_KEY)
      expect(clientObj.client_secret).to.equal(CLIENT_SECRET)
      expect(clientObj.active).to.be.a('boolean')
      expect(clientObj.active).to.equal(true)
    })

    it('Should create a new Client with autogenerated keys', async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey()

      const CLIENT_NAME = faker.lorem.words(4)
      const response = await request.post('/api/client', {
          name: CLIENT_NAME
        },
        {
          headers: {
            'Authorization': `Basic ${authKey}`
          }
        })

      const clientObj = response.data
      expect(response.status).to.equal(201)
      expect(clientObj.name).to.equal(CLIENT_NAME)
      expect(clientObj.client_key).to.be.a('string')
      expect(clientObj.client_secret).to.be.a('string')
      expect(clientObj.active).to.be.a('boolean')
      expect(clientObj.active).to.equal(true)
    })

    it('Should create a new Client with inactive status', async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey()

      const CLIENT_NAME = faker.lorem.words(4)
      const response = await request.post('/api/client', {
          name: CLIENT_NAME,
          active: false
        },
        {
          headers: {
            'Authorization': `Basic ${authKey}`
          }
        })

      const clientObj = response.data
      expect(response.status).to.equal(201)
      expect(clientObj.name).to.equal(CLIENT_NAME)
      expect(clientObj.active).to.be.a('boolean')
      expect(clientObj.active).to.equal(false)
    })
  })

  describe('Delete', () => {
    it('Should remove client', async () => {
      // Initialize auth
      const authKey = await authClient.getAuthorizationKey()

      const CLIENT_NAME = faker.lorem.words(4)
      const CLIENT_KEY = RandomString.generate({ length: 10 })
      const CLIENT_SECRET = RandomString.generate({ length: 25 })
      const client = await DB.AuthClient.create({
        name: CLIENT_NAME,
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET
      })

      const response = await request.delete(`/api/client/${client.id}`, {
        headers: {'Authorization': `Basic ${authKey}`}
      })

      expect(response.status).to.equal(204)

      const responseGet = await request.get(`/api/client/${client.id}`, {
        headers: {'Authorization': `Basic ${authKey}`}
      })

      expect(responseGet.status).to.equal(404)
    })
  })
})