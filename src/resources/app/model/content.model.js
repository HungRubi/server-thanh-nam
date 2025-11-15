const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const content = new Schema({
    name: {type: String, required: true},
    slug: {type: String, required: true, unique: true},
    image: {type: String},
    duyet: {type: Boolean, default: true},
    description: {type: String},
    metatitle: { type: String },
    metadescription: { type: String },
    metakeywords: { type: String },
}, {timestamps: true})

module.exports = mongoose.model("content", content)