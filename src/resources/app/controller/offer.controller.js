const Offer = require('../model/offer.model');
const Store = require("../model/store.model");
const { importDate } = require('../../util/importDate');

class offerController {

    /** [GET] /offer */
    async index(req, res) {
        try{
            const searchQuery = req.query.timkiem?.trim() || '';
            if(searchQuery){
                const offer = await Offer.find({
                    name: { $regex: searchQuery, $options: 'i' }
                })
                .populate("store")
                .lean();
                const offerFormat = offer.map(p => ({
                    ...p,
                    formatDate: importDate(p.createdAt)
                }))
                const data = {
                    searchType: true,
                    searchOffer: offerFormat,
                }
                return res.status(200).json({data})
            }
            const offer = await Offer.find()
                .populate("store")
                .lean();
    
            const offerFormat = offer.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))

            const totalOffer = await Offer.countDocuments();
            const totalPage = Math.ceil(totalOffer / 10);
            
            const data = {
                offerFormat,
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

    /** [POST] /offer */
    async addOffer(req, res) {
        try{
            const {
                name,
                offer,
                code,
                url,
                store,
                description,
                verified,
                duyet,
            } = req.body;
            if(!name.trim()) {
                return res.status(400).json({
                    nameEmpty: "Tên offer không được bỏ trống"
                })
            }
            if(!offer.trim()) {
                return res.status(400).json({
                    OfferEmpty: "Vui lòng chọn cửa hàng"
                })
            }
            if(!code.trim()) {
                return res.status(400).json({
                    codeEmpty: "Mã code không được bỏ trống"
                })
            }
            const verified1 = verified?.trim() || "Yes";
            const duyet1 = duyet?.trim() || "Yes";
            const newOffer = new Offer({
                name,
                offer,
                code,
                url,
                store,
                description,
                verified1,
                duyet1,
            });
            await newOffer.save();
            res.status(200).json({ message: 'Thêm offer thành công' });
        }catch(error){
            console.log(error);
            return res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [GET] /offer/:id */
    async editOffer(req, res) {
        try{
            const offer = await Offer.findById(req.params.id);
            
            const data = {
                offer
            }
            res.status(200).json({data})
        }
        catch(err){
            console.log(err);
            res.status(500).json({message: err})
        }
    }

    /** [PUT] /offer/:id */
    async updateOffer(req, res) {
        try{
            const offerId = req.params.id;
            if(!req.body.name.trim()) {
                return res.status(400).json({
                    nameEmpty: "Tên offer không được bỏ trống"
                })
            }
            if(!req.body.Offer.trim()) {
                return res.status(400).json({
                    OfferEmpty: "Vui lòng chọn cửa hàng"
                })
            }
            if(!req.body.code.trim()) {
                return res.status(400).json({
                    codeEmpty: "Mã code không được bỏ trống"
                })
            }
            const exitsOffer = await Offer.findOne({ code: req.body.code });
            if(exitsOffer && exitsOffer._id.toString() !== offerId){
                return  res.status(400).json({
                    codeEmpty: "Mã giảm giá đã tồn tại, vui lòng thử lại với mã khác !"
                })
            }
            await Offer.updateOne({_id: offerId}, req.body);
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

    /** [DELETE] /offer/:id */
    async deleteOffer(req, res) {
        try{
            const offerId = req.params.id;
            await Offer.deleteOne({_id: offerId});
            const offer = await Offer.find()
                .populate("store")
                .lean();
    
            const offerFormat = offer.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))
            res.status(200).json({
                message: "Bạn vừa xóa 1 offer!",
                offerFormat
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [DELETE] /offer/delete-many */
    async deleteManyOffer(req, res) {
        try {
            const ids  = req.body; 

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    message: "Danh sách ID không hợp lệ!"
                });
            }

            await Offer.deleteMany({ _id: { $in: ids } });

            const offer = await Offer
            .find()
            .populate('store')
            .lean();
            const offerFormat = offer.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }));

            res.status(200).json({
                offerFormat,
                message: `Bạn vừa xóa ${ids.length} Offer!`
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            });
        }
    }

    /** [GET] /offer/filter?storeId=&duyetbai= */
    async filterStore(req, res) {
        try {
            const { storeId, duyet } = req.query;

            let filter = {};

            if (storeId && storeId !== "tất cả") {
                const idsToSearch = [storeId];
                const queue = [storeId];

                while (queue.length > 0) {
                    const parentId = queue.shift();
                    const children = await Store.find({ storeId: parentId }).select("_id");
                    children.forEach(child => {
                        idsToSearch.push(child._id.toString());
                        queue.push(child._id.toString());
                    });
                }

                filter.store = { $in: idsToSearch }; // đổi từ danhmuc -> store
            }

            if (duyet && duyet !== "tất cả") {
                filter.duyet = duyet;
            }

            const offer = await Offer
                .find(filter)
                .populate("store")
                .lean();

            res.status(200).json({ offer });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Lỗi server" });
        }
    }

}

module.exports = new offerController();