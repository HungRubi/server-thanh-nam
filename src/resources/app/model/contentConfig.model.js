const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contentConfig = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    howToApply: { type: String },
    FAQs: { type: String }
}, { timestamps: true })

module.exports = mongoose.model("contentConfig", contentConfig)