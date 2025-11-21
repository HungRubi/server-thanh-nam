const express = require("express");
const route = express.Router();

const contentConfigController = require("../app/controller/contentConfig.controller");

route.get('/', contentConfigController.editContent);
route.put('/', contentConfigController.updateContent);

module.exports = route;
