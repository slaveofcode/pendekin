'use strict'

const RestifyError = require('restify-errors')
const Routing = require('restify-routing')
const moment = require('moment')
const HttpStatus = require('http-status-codes')
const DB = require(`${app_root}/models`)

const router = new Routing()

router.get('/:code', async (req, res, next) => {
  const { code } = req.params

  try {

    const shorten = await DB.ShortenUrl.findOne({
      where: {
        code: { $eq: code }
      }
    })

    if (_.isNull(shorten))
      return res.send(new RestifyError.NotFoundError('Page not found'))

    /**
     * Check for expiry
     */
    const shortenExpiredTime = moment(shorten.expired_at)
    const currentTime = moment()
    if (shortenExpiredTime.diff(currentTime) < 0)
      return res.send(new RestifyError.NotFoundError('The page has been expired'))

    /**
     * Check for password,
     * if password is exist then redirect to password-required page
     */
    return res.redirect(`${code}/password-required`)

    /**
     * Check for index url type
     */
    if (shorten.is_index_urls) {
      // fetch all child urls 
      // render html index here
    }

    /**
     * Check for auto-remove
     * delete this code if auto-remove true
     */
    if (shorten.is_auto_remove_on_visited) {
      shorten.destroy()
    }

    return res.redirect(shorten.url, next)

  } catch (err) {
    return next(err)
  }
})

router.get('/:code/password-required', async (req, res, next) => {

})

module.exports = router