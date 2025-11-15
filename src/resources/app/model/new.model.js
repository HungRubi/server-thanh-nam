const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const news = new Schema({
    name: {type: String, required: true},
    slug: {type: String, required: true, unique: true},
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'category', required: true},
    image: {type: String},
    duyet: {type: Boolean, default: true},
    description: {type: String},
    content: {type: String},
    metatitle: { type: String },
    metadescription: { type: String },
    metakeywords: { type: String },
}, {timestamps: true})

module.exports = mongoose.model("news", news)