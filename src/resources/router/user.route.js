const express = require("express");
const route = express.Router();

const userController = require('../app/controller/user.controller');

route.post("/", userController.addUser);
route.delete("/:id", userController.deleteUser);
route.put("/:id", userController.updateUser);
route.get("/:id", userController.editUser);
route.get("/", userController.index);

module.exports = route;