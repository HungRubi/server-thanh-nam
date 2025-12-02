const express = require("express");
const route = express.Router();

const eventController = require("../app/controller/event.controller");

route.delete("/delete-many", eventController.deleteManyCategory);
route.put("/:id", eventController.update);
route.post("/", eventController.add);
route.get("/:id", eventController.edit);
route.get("/", eventController.index);

module.exports = route