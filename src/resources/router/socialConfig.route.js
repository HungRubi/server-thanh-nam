const express = require("express");
const route = express.Router();

const socialController = require("../app/controller/socialConfig.controller");

route.get('/:id', socialController.editSocial);
route.put('/:id', socialController.updateSocial);
route.post('/', socialController.addSocial);

module.exports = route;
