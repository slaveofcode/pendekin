'use strict'

const pug = require('pug')

const renderer = () => {
  return (req, res, next) => {
    res.render = (pugPath, data = {}, opts = {}, status = 200) => {
      const defaultOpts = {
        cache: process.env.NODE_ENV === 'production'
      }

      const compiled = pug.compileFile(
        `${app_root}/views/${pugPath}.pug`,
        Object.assign(defaultOpts, opts)
      )

      const html = compiled(data)
      return res.send(status, html, { 'Content-Type': 'text/html' })
    }
    next()
  }
}

module.exports = renderer