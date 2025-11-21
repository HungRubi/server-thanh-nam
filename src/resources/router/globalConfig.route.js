const express = require("express");
const route = express.Router();

const globalController = require("../app/controller/globalConfig.controller");

route.put('/', globalController.updateGlobalConfig);
route.get('/', globalController.getGlobalConfig);

module.exports = route;
