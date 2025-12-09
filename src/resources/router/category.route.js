const express = require("express");
const route = express.Router();

const categoryController = require('../app/controller/category.controller');

route.post("/", categoryController.addCategory);
route.delete("/delete-many", categoryController.deleteManyCategory);
route.delete("/:id", categoryController.deleteCategory);
route.put("/:id", categoryController.updateCategory);
route.get("/slug/:slug", categoryController.slug);
route.get("/:id", categoryController.editCategory);
route.get("/", categoryController.index);

module.exports = route;