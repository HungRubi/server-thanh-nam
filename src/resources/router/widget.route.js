const express = require("express");
const route = express.Router();

const widgetController = require('../app/controller/widget.controller');

route.post("/", widgetController.addWidget);
route.delete("/:id", widgetController.deleteWidget);
route.put("/:id", widgetController.updateWidget);
route.get("/:id", widgetController.editWidget);
route.get("/", widgetController.index);


module.exports = route;