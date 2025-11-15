const express = require('express');
const route = express.Router();

const offerController = require('../app/controller/offer.controller');

route.post("/", offerController.addOffer);
route.delete("/:id", offerController.deleteOffer);
route.put("/:id", offerController.updateOffer);
route.get("/:id", offerController.editOffer);
route.get("/", offerController.index);

module.exports = route;