const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const file = new Schema({
    name: { type: String, required: true },          
    type: { type: String, required: true },          
    path: { type: String, required: true },         
    parentId: { type: Schema.Types.ObjectId, ref: "file", default: null },      
    size: { type: Number, default: 0 },              
    mimeType: { type: String },                      
}, { timestamps: true });

module.exports = mongoose.model("file", file);