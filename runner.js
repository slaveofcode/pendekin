'use strict'

const server = require('./server')

server.listen(process.env.SERVER_PORT, function () {
  console.log('%s listening at %s', server.name, server.url)
})
