const express = require("express");
const route = express.Router();

const seoConfigController = require("../app/controller/seoConfig.controller");

route.get('/:id', seoConfigController.editSeo);
route.put('/:id', seoConfigController.updateSeo);
route.post('/', seoConfigController.addSeo);

module.exports = route;
