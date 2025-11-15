const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const seoConfig = new Schema({
    metaTitle: { type: String },
    metaKeywords: { type: String },
    metaDescription: { type: String },
    googleAnalyticCode: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('seoConfig', seoConfig);  