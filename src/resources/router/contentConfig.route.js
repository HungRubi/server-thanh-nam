const express = require("express");
const route = express.Router();

const contentConfigController = require("../app/controller/contentConfig.controller");

route.get('/:id', contentConfigController.editContent);
route.put('/:id', contentConfigController.updateContent);
route.post('/', contentConfigController.addContent);

module.exports = route;
