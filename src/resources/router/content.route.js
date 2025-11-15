const express = require('express');
const route = express.Router();

const contentController = require("../app/controller/content.controller");

route.delete('/:id', contentController.deleteContent);
route.put('/:id', contentController.updateContent);
route.get('/:id', contentController.editContent);
route.post('/', contentController.addContent);
route.get('/', contentController.index);

module.exports = route