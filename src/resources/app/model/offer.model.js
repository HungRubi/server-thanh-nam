const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offer = new Schema({
    name: { type: String, required: true },
    offer: { type: String, default:'5' },
    code: { type: String, required: true, unique: true },
    url: { type: String },
    store: {type: mongoose.Schema.Types.ObjectId, ref: 'store', required: true},
    description: { type: String  }, 
    verified: { 
        type: String, 
        enum: ['Yes','No'],
        default: 'Yes'  
    },
    duyet: { 
        type: String, 
        enum: ['Yes','No'],
        default: 'Yes'  
    },
}, { timestamps: true });

module.exports = mongoose.model('offer', offer);