"use strict";

const restify = require("restify");
const _ = require("lodash");
const RestifyError = require("restify-errors");
const Routing = require("restify-routing");
const moment = require("moment");
const HttpStatus = require("http-status-codes");
const DB = require(`${project_root}/models`);
const Shorten = require("../api/utils/shorten");
const Joi = require(`${project_root}/libs/joi`);
const siteConfig = require(`${project_root}/config/site`);
const passwordLib = require(`${project_root}/libs/password`);

const router = new Routing();
const PASSWORD_PATH = "password-required";

const getShortenByCode = async code => {
  const shorten = await DB.ShortenUrl.findOne({
    where: {
      code: { $eq: code }
    }
  });

  if (_.isNull(shorten) || !_.isNil(shorten.deleted_at)) return null;
  return shorten;
};

const getShortenItems = async parentId => {
  const shortenItems = await DB.ShortenUrl.findAll({
    where: { parent_id: { $eq: parentId } }
  });

  return shortenItems ? Shorten.serializeListObj(shortenItems) : [];
};

router.get(`/:code/${PASSWORD_PATH}`, async (req, res, next) => {
  const { code } = req.params;

  try {
    const shorten = await getShortenByCode(code);

    if (_.isNull(shorten))
      return res.send(new RestifyError.NotFoundError("Page not found"));

    return res.render("password/protect", {
      title: "Please provide the Password to continue"
    });
  } catch (err) {
    return next(err);
  }
});

router.post(
  `/:code/${PASSWORD_PATH}`,
  restify.plugins.bodyParser({ mapParams: false, mapFiles: false }),
  async (req, res, next) => {
    const schema = Joi.object().keys({
      code: Joi.string().required(),
      password: Joi.string().required()
    });

    try {
      const validatedParams = await Joi.validate(
        Object.assign({}, req.params, req.body),
        schema
      );
      const shorten = await getShortenByCode(validatedParams.code);

      if (_.isNull(shorten))
        return res.send(new RestifyError.NotFoundError("Page not found"));

      if (
        await passwordLib.comparePassword(
          validatedParams.password,
          shorten.protected_password
        )
      ) {
        res.redirect(shorten.url, next);
      }

      return res.render("password/protect", {
        message: "password not valid"
      });
    } catch (err) {
      return next(err);
    }
  }
);

router.get("/:code", async (req, res, next) => {
  const { code } = req.params;

  try {
    const shorten = await getShortenByCode(code);

    if (_.isNull(shorten)) return res.render("error/404");

    /**
     * Check for expiry
     */
    if (shorten.expired_at) {
      const shortenExpiredTime = moment(shorten.expired_at);
      const currentTime = moment();
      if (shortenExpiredTime.diff(currentTime, "seconds") < 0)
        return res.send(
          new RestifyError.NotFoundError("The page has been expired")
        );
    }

    /**
     * Check for password,
     * if password is exist then redirect to password-required page
     */
    if (shorten.protected_password)
      return res.redirect(`${code}/${PASSWORD_PATH}`, next);

    /**
     * Check for index url type
     */
    if (shorten.is_index_urls) {
      const items = await getShortenItems(shorten.id);
      return res.render("index_urls", {
        shorten,
        items
      });
    }

    /**
     * Check for auto-remove
     * delete this code if auto-remove true
     */
    if (shorten.is_auto_remove_on_visited) {
      shorten.destroy();
    }

    return res.redirect(shorten.url, next);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
