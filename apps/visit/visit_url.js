"use strict";

const _ = require("lodash");
const RestifyError = require("restify-errors");
const Routing = require("restify-routing");
const moment = require("moment");
const HttpStatus = require("http-status-codes");
const DB = require(`${project_root}/models`);

const router = new Routing();
const PASSWORD_PATH = "password-required";

const getShortenByCode = async code => {
  const shorten = await DB.ShortenUrl.findAll({
    where: DB.Sequelize.where(
      DB.Sequelize.fn(
        "concat",
        DB.Sequelize.col("prefix"),
        DB.Sequelize.col("code"),
        DB.Sequelize.col("suffix")
      ),
      { $eq: code }
    ),
    include: [
      {
        model: DB.ShortenUrl,
        as: "ChildrenUrl"
      }
    ]
  });

  if (_.isNull(shorten) || !_.isNil(shorten.deleted_at)) return null;

  return shorten;
};

router.get(`/:code/${PASSWORD_PATH}`, async (req, res, next) => {
  const { code } = req.params;

  // accepting password from post data

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

router.get("/:code", async (req, res, next) => {
  const { code } = req.params;

  try {
    const shorten = await getShortenByCode(code);

    if (_.isNull(shorten))
      return res.send(new RestifyError.NotFoundError("Page not found"));

    /**
     * Check for expiry
     */
    const shortenExpiredTime = moment(shorten.expired_at);
    const currentTime = moment();
    if (shortenExpiredTime.diff(currentTime, "seconds") < 0)
      return res.send(
        new RestifyError.NotFoundError("The page has been expired")
      );

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
      // fetch all child urls
      // render html index here
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
