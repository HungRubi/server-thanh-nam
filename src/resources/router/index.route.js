const userRoute = require("./user.route");
const categoryRoute = require("./category.route");      
const storeRoute = require("./store.route");
const offerRoute = require("./offer.route");
const dealRoute = require("./deal.route");
const newRoute = require("./new.route");
const contentRoute = require("./content.route");
function route(app) {
    app.use("/content", contentRoute);
    app.use("/new", newRoute);
    app.use("/deal", dealRoute);
    app.use("/offer", offerRoute);
    app.use("/user", userRoute);
    app.use("/category", categoryRoute);
    app.use("/store", storeRoute);
}

module.exports = route;
