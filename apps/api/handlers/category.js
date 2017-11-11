"use strict";

const _ = require("lodash");
const Routing = require("restify-routing");
const RestifyError = require("restify-errors");
const HttpStatus = require("http-status-codes");
const Permission = require("../utils/permission");
const Joi = require(`${project_root}/libs/joi`);
const Pagination = require(`${project_root}/libs/pagination_parser`);
const DB = require(`${project_root}/models`);

const router = new Routing();

const pageExtractor = Pagination.parser();
const schema = Joi.object().keys({
  name: Joi.string()
    .trim()
    .required(),
  description: Joi.string()
    .trim()
    .optional()
});

router.get("/", Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req;
  const pageParams = pageExtractor(params);

  try {
    const categories = await DB.ShortenCategory.findAndCountAll(pageParams);
    return res.send({
      rows: categories.rows,
      payload: Object.assign(
        {
          count: categories.count
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
    const category = await DB.ShortenCategory.findOne({
      where: {
        id: {
          $eq: params.id
        }
      }
    });

    if (_.isNull(category))
      return res.send(new RestifyError.NotFoundError("Category not found"));
    else return res.send(category);
  } catch (err) {
    return next(err);
  }
});

router.post("/", Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req;

  try {
    const validatedParams = await Joi.validate(params, schema);
    const pageParams = pageExtractor(validatedParams);
    const { name, description } = validatedParams;
    const categories = await DB.ShortenCategory.create({
      name,
      description
    });

    res.send(HttpStatus.CREATED, categories);
    return next();
  } catch (err) {
    return next(err);
  }
});

router.put("/:id", Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req;

  try {
    const postParams = _.omit(params, ["id"]);
    const validatedParams = await Joi.validate(postParams, schema);
    const cleanParams = _.pick(validatedParams, Object.keys(postParams));
    const category = await DB.ShortenCategory.findOne({
      where: {
        id: {
          $eq: params.id
        }
      }
    });

    category.update(validatedParams);
    res.send(category);
    return next();
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req;

  try {
    const category = await DB.ShortenCategory.destroy({
      where: {
        id: { $eq: params.id }
      }
    });
    res.send(HttpStatus.NO_CONTENT);
    return next();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
