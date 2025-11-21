const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const globalConfig = new Schema({
    name: {type: String, default: "Thành Nam Store"},
    logo: {type: String},
    favicon: {type: String},
    blockIndex: {
        type: String, 
        enum: ['Yes','No'],
        default: 'No'
    },
    slogan: {type: String, default: "Uy tín tạo niềm tin"},
    notifi1: {type: String},
    notifi2: {type: String},
    nameCompany: {type: String, default: "Thanh Nam Company"},
    userPost: {type: String},
    hotline: {type: String},
    phone: {type: String},
    address: {type: String},
    email: {type: String},
    copyRight: {type: String, default: "© 2025 HungRuBy. All rights reserved."},
    linkDKBCT: {type: String},
    googleMap: {type: String},
    footer: {type: String},
    contact: {type: String},
},{ timestamps: true })

module.exports = mongoose.model("globalConfig", globalConfig)