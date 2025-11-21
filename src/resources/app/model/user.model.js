const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const users = new Schema({
    hovaten: { type: String, required: true },
    tendangnhap: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    matkhau: { type: String, required: true },
    sodienthoai: { type: String, required: true },
    refreshToken: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('users', users);