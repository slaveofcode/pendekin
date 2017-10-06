'use strict'

const axios = require('axios')

const inst = axios.create({
  baseURL: 'http://localhost:1818',
  timeout: 20000,
  validateStatus: () => true // disable any thrown error on all status code 
})

// Add a request interceptor
inst.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    console.log('request will send: '+ config.url)
    return config
  },
  function (error) {
    // Do something with request error
    console.log('request send error')
    return Promise.reject(error)
  }
)

// Add a response interceptor
inst.interceptors.response.use(
  function (response) {
    console.log('response received')
    // Do something with response data
    return response
  },
  function (error) {
    console.log('response error')
    // Do something with response error
    return Promise.reject(error)
  }
)


module.exports = inst