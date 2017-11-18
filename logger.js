'use strict'

const winston = require('winston')
const bunyanWinston = require('bunyan-winston-adapter')

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      name: 'all-logs',
      filename: './logs/all-logs.log',
      handleExceptions: true,
      level: 'debug'
    })
  ]
})

logger.exitOnError = false
logger.cli()

// Specific loggers
const container = new winston.Container()
const LOGGER_LIST = {
  PASSPORT: 'passport', // add more...
}

container.add(LOGGER_LIST.PASSPORT, {
  console: {
    colorize: true,
    label: 'Passport',
    file: {
      filename: './logs/passport-logs.log'
    }
  }
})

module.exports = {
  TYPES: LOGGER_LIST,
  getLoggerAdapter () {
    return bunyanWinston.createAdapter(logger)
  },
  getLogger (loggerType) {
    return container.get(loggerType)
  }
}
