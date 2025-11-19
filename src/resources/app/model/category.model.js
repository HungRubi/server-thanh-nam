const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const category = new Schema({
        tendanhmuc: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true },
        sapxep: { type: Number, min: 1, max: 99999, default: 1111 },
        danhmuccha: { type: String  },
        image: { type: String  },
        hienthi: { type: Boolean, default: true },
        hienthitrangchu: { type: Boolean, default: true },
        mota: { type: String  },
        metatitle: { type: String  },
        metakeywords: { type: String  },
        metadescription: { type: String  },
}, { timestamps: true });

module.exports = mongoose.model('category', category);
