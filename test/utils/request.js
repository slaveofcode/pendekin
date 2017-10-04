'use strict'

const axios = require('axios')

module.exports = axios.create({
  baseURL: 'http://localhost:1818',
  timeout: 20000,
  validateStatus: () => true // disable any thrown error on all status code 
})