"use strict";

require("./global_var");

require("dotenv").config({
  path: ".env",
  encoding: "utf8"
});

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "development";
}

const _ = require("lodash");
const restify = require("restify");
const corsMiddleware = require("restify-cors-middleware");
const passport = require("./passport");
const routes = require("./routes");
const logger = require("./logger");
const htmlRenderer = require(`${project_root}/libs/html_renderer`);

const server = restify.createServer({
  name: "pendekin",
  version: "1.0.0",
  log: logger.getLoggerAdapter(),
  formatters: {
    "text/html": (req, res, body) => {
      let data = "";
      if (!_.isNil(body)) {
        data = body.toString();
        res.setHeader("Content-Length", Buffer.byteLength(data));
      }
      return data;
    }
  }
});

const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ["http://api.myapp.com", "http://web.myapp.com", "*"],
  allowHeaders: ["API-Token"],
  exposeHeaders: ["API-Token-Expiry"]
});

/**
 * Added whitelist of 'Accept" headers 
 */
server.acceptable.push("text/html");

server.pre(restify.pre.sanitizePath());
server.pre(cors.preflight);

server.use(restify.plugins.gzipResponse());
server.use(restify.plugins.jsonBodyParser({ mapParams: true }));
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser({ mapParams: true }));
server.use(restify.plugins.fullResponse());
server.use(restify.plugins.conditionalRequest()); // ETag support
server.use(cors.actual);
server.use(passport.initialize());
server.use(passport.session());
server.use(htmlRenderer());

routes.applyRoutes(server);

module.exports = server;
