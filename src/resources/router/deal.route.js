const express = require("express");
const route = express.Router();

const dealController = require("../app/controller/deal.controller");

route.delete('/:id', dealController.deleteDeal)
route.put('/:id', dealController.updateDeal)
route.post('/', dealController.addDeal)
route.get('/:id', dealController.editDeal)
route.get('/', dealController.index)

module.exports = route