const express = require("express");
const route = express.Router();

const menuController = require("../app/controller/menu.controller");

route.delete("/delete-many", menuController.deleteManyStore);
route.delete("/:id", menuController.deleteMenu);
route.put("/:id", menuController.updateMenu);
route.post("/", menuController.addMenu);
route.get("/filter", menuController.filterMenu);
route.get("/:id", menuController.editMenu);
route.get("/", menuController.index);

module.exports = route
