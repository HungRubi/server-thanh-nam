const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const widget = new Schema({
    name: { type: String, required: true },
    link: { type: String },
    sapxep: { type: String },
    vitri: { type: String, default: 'Banner homepage' },
    stt: {type: Number, default: 99999},
    image: { type: String  }, 
    hienthi: { 
        type: String, 
        enum: ['Yes','No'],
        default: 'Yes' 
    },
    description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('widget', widget);