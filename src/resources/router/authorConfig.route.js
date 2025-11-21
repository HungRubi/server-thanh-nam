const express = require("express");
const route = express.Router();

const authorController = require("../app/controller/authorConfig.controller");

route.get('/', authorController.editAuthor);
route.put('/', authorController.updateAuthor);

module.exports = route;
