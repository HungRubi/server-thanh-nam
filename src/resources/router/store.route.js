const express = require("express");
const route = express.Router();

const storeController = require('../app/controller/store.controller');

route.post("/", storeController.addStore);
route.delete("/:id", storeController.deleteStore);
route.put("/:id", storeController.updateStore);
route.get("/:id", storeController.editStore);
route.get("/", storeController.index);


module.exports = route;