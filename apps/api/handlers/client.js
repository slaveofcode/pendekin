"use strict";

const _ = require("lodash");
const Routing = require("restify-routing");
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
  client_key: Joi.string()
    .trim()
    .optional(),
  client_secret: Joi.string()
    .trim()
    .optional(),
  active: Joi.boolean()
    .default(true)
    .optional()
});

router.get("/", Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req;
  const pageParams = pageExtractor(params);

  try {
    const clients = await DB.AuthClient.findAndCountAll(pageParams);
    return res.send({
      rows: clients.rows,
      payload: Object.assign(
        {
          count: clients.count
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
    const client = await DB.AuthClient.findOne({
      where: {
        id: {
          $eq: params.id
        }
      }
    });

    if (_.isNull(client)) return res.send(404, "Not Found");
    else return res.send(client);
  } catch (err) {
    return next(err);
  }
});

router.post("/", Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req;

  try {
    const validatedParams = await Joi.validate(params, schema);
    const pageParams = pageExtractor(validatedParams);

    const client = await DB.AuthClient.create(validatedParams);

    res.send(HttpStatus.CREATED, client);
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
    const client = await DB.AuthClient.findOne({
      where: {
        id: {
          $eq: params.id
        }
      }
    });

    client.update(validatedParams);
    res.send(client);
    return next();
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", Permission.BasicOrClient(), async (req, res, next) => {
  const { params } = req;

  try {
    const client = await DB.AuthClient.destroy({
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
