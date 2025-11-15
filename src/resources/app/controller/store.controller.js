const Store = require('../model/store.model');
const { importDate } = require('../../util/importDate');

class storeController {

    /** [GET] /store */
    async index  (req, res) {
        try{
            const searchQuery = req.query.timkiem?.trim() || '';
            if(searchQuery){
                const store = await Store.find({
                    tenstore: { $regex: searchQuery, $options: 'i' }
                })
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
            const existingSlug = await Store.findOne({slug: slug});
            if (existingSlug) {
                return res.status(400).json({
                    message: "Slug đã tồn tại"
                });
            }
            const newStore = new Store({
                tenstore,
                slug,
                danhmuc,
                event,
                image,
                duyetbai,
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
            const store = await Store.findById(req.params.id);
            const storeFormat = {
                    ...store.toObject(),
                    lastUpdate: importDate(store.updatedAt)
            }
            const data = {
                store: storeFormat
            }
            res.status(200).json({data})
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
            const existingStore = await Store.findOne({slug: req.body.slug});
            if (existingStore && existingStore._id.toString() !== storeId) {
                return res.status(400).json({
                    message: "Slug đã tồn tại"
                });
            }
            await Store.updateOne({_id: storeId}, req.body);
            res.status(200).json({
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
            res.status(200).json({
                message: "Bạn vừa xóa 1 cửa hàng!"
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }
}

module.exports = new storeController();