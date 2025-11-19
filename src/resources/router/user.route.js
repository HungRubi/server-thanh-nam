const express = require("express");
const route = express.Router();

const userController = require('../app/controller/user.controller');

route.delete("/delete-many", userController.deleteManyUser);
route.delete("/:id", userController.deleteUser);
route.put("/:id", userController.updateUser);
route.get("/:id", userController.editUser);
route.post("/", userController.addUser);
route.get("/", userController.index);

module.exports = route;