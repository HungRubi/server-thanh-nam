const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const deal = new Schema({
    name: {type: String, required: true},
    slug: { type: String, required: true, unique: true },
    danhmuc: { type: String, default: 'Deals' },
    originalPrice: { type: Number, min: 1 },
    price: {type: Number, min: 1},
    url: {type: String},
    image: {type: String},
    duyet: { 
        type: String, 
        enum: ['Yes','No'],
        default: 'Yes'  
    },
    description: {type: String},
    metatitle: { type: String },
    metadescription: { type: String },
    metakeywords: { type: String },
},{timestamps: true})

module.exports = mongoose.model("deal", deal);