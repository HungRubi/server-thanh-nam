const express = require("express");
const route = express.Router();

const seoConfigController = require("../app/controller/seoConfig.controller");

route.get('/', seoConfigController.editSeo);
route.put('/', seoConfigController.updateSeo);

module.exports = route;
