const Content = require("../model/content.model");
const {importDate} = require("../../util/importDate");

class ContentController {

    /** [GET] /content */
    async index(req, res) {
        try{
            const searchQuery = req.query.timkiem?.trim() || '';
            if(searchQuery){
                const content = await Content.find({
                    name: { $regex: searchQuery, $options: 'i' }
                })
                .sort({createdAt: -1})
                .lean();
                const contentFormat = content.map(p => ({
                    ...p,
                    formatDate: importDate(p.createdAt)
                }))
                const data = {
                    searchType: true,
                    searchWidget: contentFormat,
                }
                return res.status(200).json({data})
            }
            const content = await Content.find()
                .sort({createdAt: -1})
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
                stt,
                description,
                metatitle,
                metadescription,
                metakeywords,
            } = req.body;
            if(!name.trim()) {
                return res.status(400).json({ 
                    nameErr: "Chưa nhập tên kìa bro" 
                });
            }
            if(!slug.trim()) {
                return res.status(400).json({ 
                    slugErr: "Chưa nhập slug kìa bro" 
                });
            }
            const existsSlug = await Content.findOne({ slug: slug });
            if (existsSlug) {
                return res.status(400).json({ 
                    slugErr: "Slug đã tồn tại" 
                });
            }
            const duyet1 = duyet.trim() || "Yes"
            const newContent = new Content({
                name,
                slug,
                image,
                stt,
                duyet1,
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
            if(!req.body.name.trim()) {
                return res.status(400).json({ 
                    nameErr: "Chưa nhập tên kìa bro" 
                });
            }
            if(!req.body.slug.trim()) {
                return res.status(400).json({ 
                    slugErr: "Chưa nhập slug kìa bro" 
                });
            }
            const existingSlug = await Content.findOne({slug: req.body.slug});
            if (existingSlug && existingSlug._id.toString() !== contentId) {
                return res.status(400).json({
                    slugErr: "Slug đã tồn tại"
                });
            }
            await Content.updateOne({_id: contentId}, req.body);
            res.status(200).json({
                message: "Cập nhật trang nội dung thành công"
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
            const content = await Content.find()
                .lean();
    
            const contentFormat = content.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))
            res.status(200).json({
                message: "Bạn vừa xóa 1 trang nội dung!",
                contentFormat
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [DELETE] /content/delete-many */
    async deleteManyContent(req, res) {
        try {
            const ids  = req.body; 

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    message: "Danh sách ID không hợp lệ!"
                });
            }

            await Content.deleteMany({ _id: { $in: ids } });

            const content = await Content.find().lean();
            const contentFormat = content.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }));

            res.status(200).json({
                contentFormat,
                message: `Bạn vừa xóa ${ids.length} content!`
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            });
        }
    }
    
}

module.exports = new ContentController();