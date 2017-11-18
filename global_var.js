let path = require("path");
global.project_root = path.resolve(__dirname);
global.config_root = path.resolve(project_root, "config");
global.apps_root = path.resolve(project_root, "apps");
global.lib_root = path.resolve(project_root, "libs");
global.model_root = path.resolve(project_root, "models");
