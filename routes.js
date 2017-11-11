"use strict";

const restify = require("restify");
const Routing = require("restify-routing");
const router = new Routing();

const apps = require(`${project_root}/apps`);

router.use("/", apps);

router.get(
  /\/assets\/(.*)?.*/,
  restify.plugins.serveStatic({
    directory: `${project_root}/static`,
    appendRequestPath: false,
    default: "index.html"
  })
);

module.exports = router;
