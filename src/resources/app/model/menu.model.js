const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const menu = new Schema({
    name: {type: String, required: true},
    danhmuccha: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'menu', 
        set: v => (v === "" ? null : v)
    },
    page: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'content', 
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'category', 
        required: true
    },
    url: {type: String, required: true},
    sapxep: { type: Number },
    hienthi: { 
        type: String, 
        enum: ['Yes','No'],
        default: 'Yes' 
    },
    vitri: { 
        type: String, 
        enum: ['Menu chính','Menu chân trang'],
        default: 'Menu chính' 
    },
    
}, {timestamps: true})

module.exports = mongoose.model("menu", menu)