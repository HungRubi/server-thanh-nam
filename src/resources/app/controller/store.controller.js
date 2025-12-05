const Store = require('../model/store.model');
const Offer = require("../model/offer.model");
const Category = require("../model/category.model");
const { importDate } = require('../../util/importDate');
const mongoose = require("mongoose")
class storeController {

    /** [GET] /store */
    async index  (req, res) {
        try{
            const searchQuery = req.query.timkiem?.trim() || '';
            if(searchQuery){
                console.log(searchQuery)
                const store = await Store.find({
                    tenstore: { $regex: searchQuery, $options: 'i' }
                })
                .populate('danhmuc')
                .sort({createdAt: -1})
                .lean();
                const storeFormat = store.map(p => ({
                    ...p,
                    formatDate: importDate(p.createdAt)
                }))
                const data = {
                    searchType: true,
                    searchStore: storeFormat,
                }
                return res.status(200).json({data})
            }
            const stores = await Store.find()
                .populate('danhmuc')
                .sort({createdAt: -1})
                .lean();
    
            const storeFormat = stores.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))

            const totalStore = await Store.countDocuments();
            const totalPage = Math.ceil(totalStore / 10);
            
            const data = {
                storeFormat,
                totalPage,
                searchType: false,
            }
            return res.status(200).json({data});
        }catch(error){
            console.log(error);
            return res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [POST] /store */
    async addStore(req, res) {
        try{
            const {
                tenstore,
                slug,
                danhmuc,
                event,
                stt,
                image,
                duyetbai,
                motangan,
                about,
                howtoapply,
                faqs,
                metatitle,
                metadescription,
                metakeywords,
            } = req.body;
            if(!danhmuc.trim()) {
                 return res.status(400).json({
                    danhmucErr: "Vui lòng chọn danh mục"
                })
            }
            if(tenstore === '') {
                return res.status(400).json({
                    tenstoreErr: "Tên store không được bỏ trống"
                })
            }
            const exitsTenStore = await Store.findOne({tenstore: tenstore})
            if(exitsTenStore) {
                return res.status(400).json({
                    tenstoreErr: "Tên store đã tồn tại"
                })
            }
            if(slug === '') {
                return res.status(400).json({
                    slugErr: "Slug không được bỏ trống"
                })
            }
            const exitsSlug = await Store.findOne({slug: slug})
            if(exitsSlug) {
                return res.status(400).json({
                    slugErr: "Slug đã tồn tại"
                })
            }
            const duyet1 = duyetbai.trim() || "Yes"
            const newStore = new Store({
                tenstore,
                slug,
                danhmuc,
                event,
                stt,
                image,
                duyet1,
                motangan,
                about,
                howtoapply,
                faqs,
                metatitle,
                metadescription,
                metakeywords
            });
            await newStore.save();
            return  res.status(200).json({
                message: "Thêm cửa hàng thành công"
            });  
            
        }catch(error){
            console.log(error);
            return res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [GET] /store/:id */
    async editStore(req, res) {
        try{
            if(req.params.id) {
                if(!req.params.id) {
                    return res.status(400).json({
                        message: "Không có store này"
                    })
                }
                const store = await Store.findById(req.params.id);
                if(!store) {
                    return res.status(400).json({
                        message: "Không có store này"
                    })
                }
                const storeFormat = {
                        ...store.toObject(),
                        lastUpdate: importDate(store.updatedAt)
                }
                const offers = await Offer.find({store: req.params.id}).lean();
                const data = {
                    offers,
                    store: storeFormat
                }
                return res.status(200).json({data})
            }
        }
        catch(err){
            console.log(err);
            res.status(500).json({message: err})
        }
    }

    /** [PUT] /store/:id */
    async updateStore(req, res) {
        try{
            const storeId = req.params.id;
            if (!req.body.tenstore?.trim()) {
                return res.status(400).json({ tenstoreErr: "Tên store không được bỏ trống" });
            }

            const existsTenStore = await Store.findOne({ tenstore: req.body.tenstore });
            if (existsTenStore && existsTenStore._id.toString() !== storeId) {
                return res.status(400).json({ tenstoreErr: "Tên store đã tồn tại" });
            }

            if (!req.body.slug?.trim()) {
                return res.status(400).json({ slugErr: "Slug không được bỏ trống" });
            }

            const existsSlug = await Store.findOne({ slug: req.body.slug });
            if (existsSlug && existsSlug._id.toString() !== storeId) {
                return res.status(400).json({ slugErr: "Slug đã tồn tại" });
            }
            const updateData = {
                ...req.body,
                danhmuc: new mongoose.Types.ObjectId(req.body.danhmuc),
            }

            await Store.updateOne({ _id: storeId }, updateData);
            return res.status(200).json({
                message: "Cập nhật cửa hàng thành công :))"
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [DELETE] /store/:id */
    async deleteStore(req, res) {
        try{
            const storeId = req.params.id;
            await Store.deleteOne({_id: storeId});
            const store = await Store
            .find()
            .populate('danhmuc')
            .lean();
            const storeFormat = store.map(p => ({
                    ...p,
                    formatDate: importDate(p.createdAt)
                }))
            res.status(200).json({
                message: "Bạn vừa xóa 1 cửa hàng!",
                storeFormat
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [DELETE] /store/delete-many */
    async deleteManyStore(req, res) {
        try {
            const ids  = req.body; 

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    message: "Danh sách ID không hợp lệ!"
                });
            }

            await Store.deleteMany({ _id: { $in: ids } });

            const store = await Store.find().lean();
            const storeFormat = store.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }));

            res.status(200).json({
                storeFormat,
                message: `Bạn vừa xóa ${ids.length} store!`
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            });
        }
    }

    /** [GET] /store/filter?danhmucId=&duyetbai= */
    async  filterStore(req, res) {
        try {
            const { danhmucId, duyetbai } = req.query; 
            console.log(danhmucId);
            console.log(duyetbai);

            let filter = {};

            if (duyetbai && duyetbai !== "Tất cả") {
                filter.duyetbai = duyetbai;
            }

            if (danhmucId && danhmucId !== "tất cả") {
                const idsToSearch = [danhmucId];
                const queue = [danhmucId];

                while (queue.length > 0) {
                    const parentId = queue.shift();
                    const children = await Category.find({ danhmuccha: parentId }).select("_id");
                    children.forEach(child => {
                        idsToSearch.push(child._id);
                        queue.push(child._id); 
                    });
                }

                filter.danhmuc = { $in: idsToSearch };
            }

            const stores = await Store.find(filter)
                .populate("danhmuc", "tendanhmuc slug hienthi");

            res.status(200).json({ stores });


        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Lỗi server" });
        }
    }

}

module.exports = new storeController();