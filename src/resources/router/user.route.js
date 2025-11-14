const express = require("express");
const route = express.Router();

const userController = require('../app/controller/user.controller');


route.get("/", userController.index);


module.exports = route;