const Content = require("../model/content.model");
const {importDate} = require("../../util/importDate");

class ContentController {

    /** [GET] /new */
    async index(req, res) {
        try{
            const searchQuery = req.query.timkiem?.trim() || '';
            if(searchQuery){
                const content = await Content.find({
                    name: { $regex: searchQuery, $options: 'i' }
                })
                .lean();
                const contentFormat = content.map(p => ({
                    ...p,
                    formatDate: importDate(p.createdAt)
                }))
                const data = {
                    searchType: true,
                    searchNew: contentFormat,
                }
                return res.status(200).json({data})
            }
            const content = await Content.find()
                .lean();
    
            const contentFormat = content.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))

            const totalContent = await Content.countDocuments();
            const totalPage = Math.ceil(totalContent / 10);
            
            const data = {
                contentFormat,
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
    async addContent(req, res) {
        try {
            const {
                name,
                slug,
                image,
                duyet,
                description,
                metatitle,
                metadescription,
                metakeywords,
            } = req.body;

            const existsSlug = await Content.findOne({ slug });
            if (existsSlug) {
                return res.status(400).json({ message: "Slug đã tồn tại" });
            }

            const newContent = new Content({
                name,
                slug,
                image,
                duyet,
                description,
                metatitle,
                metadescription,
                metakeywords,
            });

            await newContent.save();

            return res.status(200).json({
                message: "Thêm trang nội dung thành công",
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :((",
            });
        }
    }

    /** [GET] /new/:id */
    async editContent(req, res) {
        try{
            const content = await Content.findById(req.params.id);
            const contentFormat = {
                    ...content.toObject(),
                    lastUpdate: importDate(content.updatedAt)
            }
            const data = {
                content: contentFormat
            }
            res.status(200).json({data})
        }
        catch(err){
            console.log(err);
            res.status(500).json({message: err})
        }
    }

    /** [PUT] /new/:id */
    async updateContent(req, res) {
        try{
            const contentId = req.params.id;
            const existingSlug = await Content.findOne({slug: req.body.slug});
            if (existingSlug && existingSlug._id.toString() !== contentId) {
                return res.status(400).json({
                    message: "Slug đã tồn tại"
                });
            }
            await Content.updateOne({_id: contentId}, req.body);
            res.status(200).json({
                message: "Cập nhật trang nội dung thành công :))"
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [DELETE] /new/:id */
    async deleteContent(req, res) {
        try{
            const contentId = req.params.id;
            await Content.deleteOne({_id: contentId});
            res.status(200).json({
                message: "Bạn vừa xóa 1 trang nội dung!"
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }
    
}

module.exports = new ContentController();