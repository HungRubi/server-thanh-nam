const userRoute = require("./user.route");
const authenticationRoute = require("./authentication.route");
const categoryRoute = require("./category.route");      
const storeRoute = require("./store.route");
const offerRoute = require("./offer.route");
const dealRoute = require("./deal.route");
const newRoute = require("./new.route");
const contentRoute = require("./content.route");
const widgetRoute = require("./widget.route");
const globalRoute = require("./globalConfig.route");
const authorRoute = require("./authorConfig.route");
const socialRoute = require("./socialConfig.route");
const seoRoute = require("./seoConfig.route");
const menu = require("./menu.route");
const contentConfigRoute = require("./contentConfig.route");
const fileRoute = require("./file.route");
function route(app) {
    app.use("/auth", authenticationRoute);
    app.use("/file", fileRoute);
    app.use("/menu", menu);
    app.use("/content-config", contentConfigRoute);
    app.use("/seo", seoRoute);
    app.use("/social", socialRoute);
    app.use("/author", authorRoute);
    app.use("/global", globalRoute);
    app.use("/widget", widgetRoute);
    app.use("/content", contentRoute);
    app.use("/new", newRoute);
    app.use("/deal", dealRoute);
    app.use("/offer", offerRoute);
    app.use("/user", userRoute);
    app.use("/category", categoryRoute);
    app.use("/store", storeRoute);
}

module.exports = route;
