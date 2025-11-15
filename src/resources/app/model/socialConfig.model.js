const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const socialConfig = new Schema({
    iamge: { type: String },
    facebook: { type: String },
    facebookPage: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    pinterest: { type: String },
    youtube: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('socialConfig', socialConfig);