"use strict";

const _ = require("lodash");
const moment = require("moment");
const Routing = require("restify-routing");
const HttpStatus = require("http-status-codes");
const RestifyError = require("restify-errors");
const Moment = require("moment");
const Permission = require("../utils/permission");
const Shorten = require("../utils/shorten");
const Joi = require(`${project_root}/libs/joi`);
const DB = require(`${project_root}/models`);
const CodeGenerator = require(`${project_root}/libs/code_generator`);
const Pagination = require(`${project_root}/libs/pagination_parser`);
const siteConfig = require(`${config_root}/site`);

const router = new Routing();
const pageExtractor = Pagination.parser();

const schema = Joi.object().keys({
  url: Joi.string()
    .trim()
    .lowercase()
    .required(),
  category_id: Joi.string(),
  prefix: Joi.string()
    .trim()
    .max(5),
  password: Joi.string(),
  expired_at: Joi.date().iso(),
  custom_code: Joi.string(),
  auto_removed: Joi.boolean().default(false),
  reuse_existing: Joi.boolean().default(false),
  is_index: Joi.boolean().default(false)
});

const schemaEdit = Joi.object().keys({
  id: Joi.string().required(),
  url: Joi.string()
    .trim()
    .lowercase(),
  category_id: Joi.string(),
  password: Joi.string(),
  expired_at: Joi.date().iso()
});

const schemaBulk = Joi.array().items(schema);

router.get("/", Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req;
  const pageParams = pageExtractor(params);

  try {
    const shortens = await DB.ShortenUrl.findAndCount(pageParams);
    return res.send({
      rows: shortens.rows,
      payload: Object.assign(
        {
          count: shortens.count
        },
        pageParams
      )
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req;

  try {
    const shorten = await DB.ShortenUrl.findOne({
      where: { id: { $eq: params.id } }
    });

    if (_.isNull(shorten))
      return res.send(new RestifyError.NotFoundError("Item not found"));

    return res.send(HttpStatus.OK, Shorten.serializeObj(shorten));
  } catch (err) {
    return next(err);
  }
});

router.post("/", Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req;

  try {
    const validatedParams = await Joi.validate(params, schema);

    const { reuse_existing, url } = validatedParams;

    let shortenCode = reuse_existing ? await Shorten.reuseExisting(url) : null;

    if (reuse_existing && shortenCode)
      return res.send(HttpStatus.OK, Shorten.serializeObj(shortenCode));

    if (shortenCode === null) {
      shortenCode = await Shorten.getShorten(validatedParams);
    }

    /**
     * Throwing any errors
     */
    if (
      shortenCode instanceof RestifyError.HttpError ||
      shortenCode instanceof RestifyError.RestError
    ) {
      return res.send(shortenCode);
    }

    return res.send(
      HttpStatus.CREATED,
      Shorten.serializeObj(await Shorten.saveShorten(shortenCode))
    );
  } catch (err) {
    console.log(err);
    return next(err);
  }
});

router.post("/bulk", Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req;

  try {
    const validatedBulkParams = await Joi.validate(params, schemaBulk);

    const bulkParams = [];
    const existingShortens = [];
    for (let shortenParam of validatedBulkParams) {
      let shortenCode = shortenParam.reuse_existing
        ? await Shorten.reuseExisting(shortenParam.url)
        : null;

      if (shortenCode !== null) existingShortens.push(shortenCode);

      while (shortenCode === null) {
        shortenParam.throwOnError = false;
        shortenCode = await Shorten.getShorten(shortenParam);
        if (shortenCode !== null) bulkParams.push(shortenCode);
      }
    }

    const shortens = await Shorten.saveShorten(bulkParams);
    const mergedShortens = shortens.concat(existingShortens);

    const statusCode =
      bulkParams.length < validatedBulkParams.length
        ? HttpStatus.MULTI_STATUS
        : HttpStatus.CREATED;

    return res.send(statusCode, Shorten.serializeListObj(mergedShortens));
  } catch (err) {
    return next(err);
  }
});

router.post("/check", Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req;

  try {
    const schemaCheck = Joi.object().keys({ code: Joi.string() });
    const validatedParams = await Joi.validate(params, schemaCheck);
    const { code } = validatedParams;

    const available = await Shorten.isCodeAvailable(code);
    return res.send(available ? HttpStatus.CONFLICT : HttpStatus.NO_CONTENT);
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req;

  try {
    const validatedParams = await Joi.validate(params, schemaEdit);
    const { id, url, password, category_id, expired_at } = validatedParams;

    const shorten = await DB.ShortenUrl.findOne({
      where: { id: { $eq: id } }
    });

    if (_.isNull(shorten))
      return res.send(
        new RestifyError.NotFoundError("Item could not be found")
      );

    const shortenUpdateParam = {};

    if (url) {
      if (!Shorten.checkUrlValidity(url))
        return res.send(
          new RestifyError.BadRequestError("URL parameter is not valid")
        );

      Object.assign(shortenUpdateParam, { url });
    }

    /**
     * Checking category
     */
    let shorten_category_id = null;
    if (!_.isNil(category_id)) {
      shorten_category_id = await Shorten.normalizeCategory(category_id);
      if (_.isNull(shorten_category_id))
        return res.send(new RestifyError.BadRequestError("Category not found"));

      Object.assign(shortenUpdateParam, { shorten_category_id });
    }

    /**
     * Checking protected password
     */
    if (password) {
      let protected_password = await Shorten.hashPassword(password);
      Object.assign(shortenUpdateParam, { protected_password });
    }

    /**
     * Checking expired time
     */
    if (expired_at) {
      Object.assign(shortenUpdateParam, {
        expired_at: Shorten.normalizeExpiredTime(expired_at)
      });
    }

    await shorten.update(shortenUpdateParam);

    return res.send(HttpStatus.OK, Shorten.serializeObj(shorten));
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req;

  try {
    const shorten = await DB.ShortenUrl.findOne({
      where: { id: { $eq: params.id } }
    });

    if (_.isNull(shorten) || !_.isNull(shorten.deleted_at))
      return res.send(RestifyError.NotFoundError("Item not found"));

    await shorten.destroy();

    return !_.isNull(shorten.deleted_at)
      ? res.send(HttpStatus.NO_CONTENT)
      : res.send(HttpStatus.BAD_REQUEST);
  } catch (err) {
    return next(err);
  }
});

router.post(
  "/bulk/delete",
  Permission.BasicOrClient(),
  async (req, res, next) => {
    const { params } = req;

    try {
      const schemaIds = Joi.array().items(Joi.string());
      const validatedParams = await Joi.validate(params, schemaIds);

      const shortens = await DB.ShortenUrl.findAll({
        where: { id: { $in: validatedParams } }
      });

      const promises = [];
      for (let shorten of shortens) {
        promises.push(shorten.destroy());
      }

      await Promise.all(promises);

      return res.send(HttpStatus.NO_CONTENT);
    } catch (err) {
      return next(err);
    }
  }
);

router.post("/items", Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req;

  try {
    const schemaItems = Joi.object().keys({
      parent_id: Joi.string().required(),
      items: schemaBulk
    });

    const validatedParams = await Joi.validate(params, schemaItems);

    const { parent_id, items } = validatedParams;

    const shorten = await DB.ShortenUrl.findOne({
      where: { id: { $eq: parent_id } }
    });

    if (_.isNull(shorten))
      return res.send(new RestifyError.NotFoundError("Item not found"));

    const bulkParams = [];
    for (let shortenParam of items) {
      Object.assign(shortenParam, { parent_id });
      let code = null;
      while (code === null) {
        code = await Shorten.getShorten(shortenParam);
        if (code !== null) bulkParams.push(code);
      }
    }

    const shortens = await Shorten.saveShorten(bulkParams);

    const statusCode =
      bulkParams.length < items.length
        ? HttpStatus.MULTI_STATUS
        : HttpStatus.CREATED;

    return res.send(statusCode, Shorten.serializeListObj(shortens));
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
