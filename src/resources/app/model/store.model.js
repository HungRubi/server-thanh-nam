const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const store = new Schema({
    tenstore: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    danhmuc: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'category', 
        required: true
    },
    stt: {type: Number, default: 999},
    event: { type: String, default: 'Uncategorized' },
    image: { type: String },
    duyetbai: { 
        type: String, 
        enum: ['Yes','No'],
        default: 'Yes' 
    },
    motangan: { type: String },
    about: { type: String },
    howtoapply: { type: String },
    faqs: { type: String },
    metatitle: { type: String },
    metadescription: { type: String },
    metakeywords: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('store', store);