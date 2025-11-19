const News = require("../model/new.model");
const Category = require("../model/category.model");
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
                .populate("category")
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
            const news = await News
            .find()
            .populate("category")
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
            if(!name.trim()) {
                return res.status(400).json({
                    nameErr: "Chưa nhập tên bài viết kìa bro"
                })
            }
            if(!slug.trim()) {
                return res.status(400).json({
                    slugErr: "Chưa nhập slug kìa bro"
                })
            }
            const exitsSlug = await News.findOne({slug: req.body.slug});
            if(exitsSlug) {
                return res.status(400).json({
                    slugErr: "Slug đã tồn tại"
                })
            }
            if(!category.trim()) {
                return res.status(400).json({
                    categoryErr: "Vui lòng chọn danh mục"
                })
            }
            const duyet1 = duyet.trim() || "Yes"
            const newNews = new News({
                name,
                slug,
                category,
                image,
                duyet1,
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
                news: newFormat
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

            if(!req.body.name.trim()) {
                return res.status(400).json({
                    nameErr: "Chưa nhập tên bài viết kìa bro"
                });
            }

            if(!req.body.slug.trim()) {
                return res.status(400).json({
                    slugErr: "Chưa nhập slug kìa bro"
                });
            }

            const existingSlug = await News.findOne({ slug: req.body.slug });

            if (existingSlug && existingSlug._id.toString() !== newId) {
                return res.status(400).json({
                    slugErr: "Slug đã tồn tại"
                });
            }

            if(!req.body.category.trim()) {
                return res.status(400).json({
                    categoryErr: "Vui lòng chọn danh mục"
                });
            }

            await News.updateOne({ _id: newId }, req.body);

            res.status(200).json({
                message: "Cập nhật tin tức thành công!"
            });

        } catch (error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            });
        }
    }

    /** [DELETE] /new/:id */
    async deleteNew(req, res) {
        try{
            const newId = req.params.id;
            await News.deleteOne({_id: newId});
            const news = await News
            .find()
            .populate("category")
            .lean();
    
            const newFormat = news.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))
            res.status(200).json({
                message: "Bạn vừa xóa 1 tin tức!",
                newFormat
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [DELETE] /new/delete-many */
    async deleteManyNew(req, res) {
        try {
            const ids  = req.body; 

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    message: "Danh sách ID không hợp lệ!"
                });
            }

            await News.deleteMany({ _id: { $in: ids } });

            const news = await News.find().lean();
            const newFormat = news.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }));

            res.status(200).json({
                newFormat,
                message: `Bạn vừa xóa ${ids.length} tin tức!`
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            });
        }
    }

    /** [GET] /news/filter */
    async  filterNews(req, res) {
        try {
            const { categoryId, duyet } = req.query;

            console.log(categoryId);
            console.log(duyet);

            let filter = {};

            if (duyet && duyet !== "Tất cả") {
                filter.duyet = duyet;  // Yes / No
            }

            if (categoryId && categoryId !== "tất cả") {

                const idsToSearch = [categoryId];
                const queue = [categoryId];

                while (queue.length > 0) {
                    const parentId = queue.shift();
                    const children = await Category.find({ danhmuccha: parentId }).select("_id");
                    
                    children.forEach(child => {
                        idsToSearch.push(child._id);
                        queue.push(child._id);
                    });
                }

                filter.category = { $in: idsToSearch };
            }

            const newsList = await News.find(filter)
            .populate("category")  
            .sort({ createdAt: -1 })
            .lean();
            const newFormat = newsList.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))

            res.status(200).json({ newsList: newFormat });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Lỗi server" });
        }
    }

    
}

module.exports = new NewController();