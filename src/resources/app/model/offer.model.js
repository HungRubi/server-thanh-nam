const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offer = new Schema({
    name: { type: String, required: true },
    offer: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    url: { type: String },
    store: {type: mongoose.Schema.Types.ObjectId, ref: 'store', required: true},
    description: { type: String  }, 
    verified: { type: Boolean, default: true },
    duyet: { type: Boolean, default: true  },
}, { timestamps: true });

module.exports = mongoose.model('offer', offer);