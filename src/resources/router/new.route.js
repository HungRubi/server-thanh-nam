const express = require('express');
const route = express.Router();

const newController = require("../app/controller/new.controller");

route.delete('/:id', newController.deleteNew);
route.put('/:id', newController.updateNew);
route.get('/:id', newController.editNew);
route.post('/', newController.addNew);
route.get('/', newController.index);

module.exports = route