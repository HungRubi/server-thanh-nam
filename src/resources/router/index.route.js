const userRoute = require("./user.route");

function route(app) {
    app.use("/users", userRoute);
}

module.exports = route;
