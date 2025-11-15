const News = require("../model/new.model");
const {importDate} = require("../../util/importDate");

class NewController {

    /** [GET] /new */
    async index(req, res) {
        try{
            const searchQuery = req.query.timkiem?.trim() || '';
            if(searchQuery){
                const news = await News.find({
                    name: { $regex: searchQuery, $options: 'i' }
                })
                .lean();
                const newFormat = news.map(p => ({
                    ...p,
                    formatDate: importDate(p.createdAt)
                }))
                const data = {
                    searchType: true,
                    searchNew: newFormat,
                }
                return res.status(200).json({data})
            }
            const news = await News.find()
                .lean();
    
            const newFormat = news.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))

            const totalNew = await News.countDocuments();
            const totalPage = Math.ceil(totalNew / 10);
            
            const data = {
                newFormat,
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

    /** [POST] /new */
    async addNew(req, res) {
        try{
            const {
                name,
                slug,
                category,
                image,
                duyet,
                description,
                content,
                metatitle,
                metadescription,
                metakeywords,
            } = req.body
            const exitsSlug = await News.findOne({slug: req.body.slug});
            if(exitsSlug) {
                return res.status(400).json({
                    message: "Slug đã tồn tại"
                })
            }
            const newNews = new News({
                name,
                slug,
                category,
                image,
                duyet,
                description,
                content,
                metatitle,
                metadescription,
                metakeywords,
            })
            await newNews.save();
            return res.status(200).json({
                message: 'Thêm tin tức thành công'
            })
        }catch(error) {
            console.log(error);
            return res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [GET] /new/:id */
    async editNew(req, res) {
        try{
            const news = await News.findById(req.params.id);
            const newFormat = {
                    ...news.toObject(),
                    lastUpdate: importDate(news.updatedAt)
            }
            const data = {
                offer: newFormat
            }
            res.status(200).json({data})
        }
        catch(err){
            console.log(err);
            res.status(500).json({message: err})
        }
    }

    /** [PUT] /new/:id */
    async updateNew(req, res) {
        try{
            const newId = req.params.id;
            const existingSlug = await News.findOne({slug: req.body.slug});
            if (existingSlug && existingSlug._id.toString() !== offerId) {
                return res.status(400).json({
                    message: "Slug đã tồn tại"
                });
            }
            await News.updateOne({_id: newId}, req.body);
            res.status(200).json({
                message: "Cập nhật tin tức thành công :))"
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [DELETE] /new/:id */
    async deleteNew(req, res) {
        try{
            const newId = req.params.id;
            await News.deleteOne({_id: newId});
            res.status(200).json({
                message: "Bạn vừa xóa 1 tin tức!"
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }
    
}

module.exports = new NewController();