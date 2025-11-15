const Offer = require('../model/offer.model');
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
            const exitsOffer = await Offer.findOne({ code: req.body.code });
            if(exitsOffer){
                return  res.status(400).json({
                    message: "Mã giảm giá đã tồn tại, vui lòng thử lại với mã khác !"
                })
            }
            const newOffer = new Offer({
                name,
                offer,
                code,
                url,
                store,
                description,
                verified,
                duyet,
            });
            await newOffer.save();
            res.status(200).json({ message: 'Thêm mã giảm giá thành công' });
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
            const offerFormat = {
                    ...offer.toObject(),
                    lastUpdate: importDate(offer.updatedAt)
            }
            const data = {
                offer: offerFormat
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
            const existingOffer = await Offer.findOne({code: req.body.code});
            if (existingOffer && existingOffer._id.toString() !== offerId) {
                return res.status(400).json({
                    message: "Code đã tồn tại"
                });
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

module.exports = new offerController();