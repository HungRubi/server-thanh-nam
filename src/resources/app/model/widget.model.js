const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const widget = new Schema({
    name: { type: String, required: true },
    link: { type: String },
    sapxep: { type: String },
    vitri: { type: String, default: 'Banner homepage' },
    image: { type: String  }, 
    hienthi: { type: Boolean, default: true },
    description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('widget', widget);