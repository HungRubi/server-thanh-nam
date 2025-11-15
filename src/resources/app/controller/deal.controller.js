const Deal = require("../model/deal.model");
const {importDate} = require("../../util/importDate");

class DealController {

    /** [GET] /deal */
    async index (req, res) {
        try{
            const searchQuery = req.query.timkiem?.trim() || '';
            if(searchQuery){
                const deal = await Deal.find({
                    name: { $regex: searchQuery, $options: 'i' }
                })
                .lean();
                const dealFormat = deal.map(p => ({
                    ...p,
                    formatDate: importDate(p.createdAt)
                }))
                const data = {
                    searchType: true,
                    searchDeal: dealFormat,
                }
                return res.status(200).json({data})
            }
            const deal = await Deal.find()
                .lean();
    
            const dealFormat = deal.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))

            const totalDeal = await Deal.countDocuments();
            const totalPage = Math.ceil(totalDeal / 10);
            
            const data = {
                dealFormat,
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

    /** [POST] /deal */
    async addDeal(req, res) {
        try{
            const {
                name,
                slug,
                danhmuc,
                originalPrice,
                price,
                url,
                image,
                duyet,
                description,
                metatitle,
                metadescription,
                metakeywords
            } = req.body;
            const existingSlug = await Deal.findOne({slug: req.body.slug});
            if(existingSlug) {
                return res.status(400).json({
                    message: "Slug đã tồn tại"
                })
            }
            const newDeal = new Deal({
                name,
                slug,
                danhmuc,
                originalPrice,
                price,
                url,
                image,
                duyet,
                description,
                metatitle,
                metadescription,
                metakeywords
            })
            await newDeal.save();
            return res.status(200).json({
                message: "Thêm Deal thành công"
            })
        }catch(error) {
            console.log(error);
            return res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [GET] /deal/:id */
    async editDeal (req, res) {
        try{
            const deal = await Deal.findById(req.params.id);
            const dealFormat = {
                ...deal.toObject(),
                lastUpdate: importDate(deal.updatedAt)
            }
            const data = {
                store: dealFormat
            }
            res.status(200).json({data})
        }
        catch(err){
            console.log(err);
            res.status(500).json({message: err})
        }
    }

    /** [PUT] /deal/:id */
    async updateDeal(req, res) {
        try{
            const dealId = req.params.id;
            const existingDeal = await Deal.findOne({slug: req.body.slug});
            if (existingDeal && existingDeal._id.toString() !== dealId) {
                return res.status(400).json({
                    message: "Slug đã tồn tại"
                });
            }
            await Deal.updateOne({_id: dealId}, req.body);
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

    /** [DELETE] /deal/:id */
    async deleteDeal(req, res) {
        try{
            const dealId = req.params.id;
            await Deal.deleteOne({_id: dealId});
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

module.exports = new DealController();