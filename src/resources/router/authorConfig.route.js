const express = require("express");
const route = express.Router();

const authorController = require("../app/controller/authorConfig.controller");

route.get('/:id', authorController.editAuthor);
route.put('/:id', authorController.updateAuthor);
route.post('/', authorController.addAuthor);

module.exports = route;
