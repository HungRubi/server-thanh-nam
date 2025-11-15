const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const store = new Schema({
    tenstore: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    danhmuc: { type: String },
    event: { type: String },
    image: { type: String },
    duyetbai: { type: Boolean, default: true },
    motangan: { type: String },
    about: { type: String },
    howtoapply: { type: String },
    faqs: { type: String },
    metatitle: { type: String },
    metadescription: { type: String },
    metakeywords: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('store', store);