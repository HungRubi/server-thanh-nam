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
            if(!name.trim()) {
                return res.status(400).json({
                    nameErr: "Quên nhập tên kìa bro!"
                })
            }
            if(!slug.trim()) {
                return res.status(400).json({
                    slugErr: "Slug không được bỏ trống"
                })
            }
            const existingSlug = await Deal.findOne({slug: req.body.slug});
            if(existingSlug) {
                return res.status(400).json({
                    slugErr: "Slug đã tồn tại"
                })
            }
            const duyet1 = duyet.trim() || "Yes"
            const danhmuc1 = danhmuc.trim() || "Deals"
            const newDeal = new Deal({
                name,
                slug,
                danhmuc1,
                originalPrice,
                price,
                url,
                image,
                duyet1,
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
                deal: dealFormat
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
            console.log(req.body)
            if(!req.body.name.trim()) {
                return res.status(400).json({
                    nameErr: "Quên nhập tên kìa bro!"
                })
            }
            if(!req.body.slug.trim()) {
                return res.status(400).json({
                    slugErr: "Slug không được bỏ trống"
                })
            }
            const existingSlug = await Deal.findOne({slug: req.body.slug});
            if(existingSlug && existingSlug._id.toString() !== dealId) {
                return res.status(400).json({
                    slugErr: "Slug đã tồn tại"
                })
            }
            await Deal.updateOne({_id: dealId}, req.body);
            res.status(200).json({
                message: "Cập nhật deal thành công"
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
            const deal = await Deal.find()
                .lean();
    
            const dealFormat = deal.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))
            res.status(200).json({
                message: "Bạn vừa xóa 1 cửa hàng!",
                deal: dealFormat
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [DELETE] /deal/delete-many */
    async deleteManyDeal(req, res) {
        try {
            const ids  = req.body; 

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    message: "Danh sách ID không hợp lệ!"
                });
            }

            await Deal.deleteMany({ _id: { $in: ids } });

            const deal = await Deal
            .find()
            .lean();
            const dealFormat = deal.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }));

            res.status(200).json({
                dealFormat,
                message: `Bạn vừa xóa ${ids.length} deal!`
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            });
        }
    }

    /** [GET] /deal/filter */
    async filterDeal(req, res) {
        try {
            const { danhmuc, duyet } = req.query;
            console.log(danhmuc);
            console.log(duyet);

            let filter = {};

            if (danhmuc && danhmuc !== "tất cả") {
                filter.danhmuc = danhmuc;
            }

            if (duyet && duyet !== "tất cả") {
                filter.duyet = duyet;
            }

            const deals = await Deal
                .find(filter)
                .lean();

            return res.status(200).json({ deals });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Lỗi server" });
        }
    }

}

module.exports = new DealController();