const express = require("express");
const route = express.Router();

const categoryController = require('../app/controller/category.controller');

route.post("/", categoryController.addCategory);
route.delete("/:id", categoryController.deleteCategory);
route.put("/:id", categoryController.updateCategory);
route.get("/:id", categoryController.editCategory);
route.get("/", categoryController.index);

module.exports = route;