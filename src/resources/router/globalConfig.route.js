const express = require("express");
const route = express.Router();

const globalController = require("../app/controller/globalConfig.controller");

route.get('/:id', globalController.editGlobal);
route.put('/:id', globalController.updateGlobal);
route.post('/', globalController.addGlobal);

module.exports = route;
