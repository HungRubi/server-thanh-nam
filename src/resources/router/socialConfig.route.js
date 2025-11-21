const express = require("express");
const route = express.Router();

const socialController = require("../app/controller/socialConfig.controller");

route.get('/', socialController.editSocial);
route.put('/', socialController.updateSocial);

module.exports = route;
