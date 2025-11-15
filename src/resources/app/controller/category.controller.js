const Category = require('../model/category.model');
const { importDate } = require('../../util/importDate');
class CategoryController {

    /** [GET] /category */
    async index  (req, res) {
        try{
            const searchQuery = req.query.timkiem?.trim() || '';
            if(searchQuery){
                const category = await Category.find({
                    tendanhmuc: { $regex: searchQuery, $options: 'i' }
                })
                .lean();
                const categoryFormat = category.map(p => ({
                    ...p,
                    formatDate: importDate(p.createdAt)
                }))
                const data = {
                    searchType: true,
                    searchCategory: categoryFormat,
                }
                return res.status(200).json({data})
            }
            const categories = await Category.find()
                .lean();
    
            const categoryFormat = categories.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))

            const totalCategory = await Category.countDocuments();
            const totalPage = Math.ceil(totalCategory / 10);
            
            const data = {
                categoryFormat,
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

    /** [POST] /category */
    async addCategory(req, res) {
        try{
            const {
                tendanhmuc,
                slug,
                sapxep,
                danhmuccha,
                image,
                hienthi,
                mota,
                metatitle,
                metakeywords,
                metadescription,
            } = req.body;

            const newCategory = new Category({
                tendanhmuc,
                slug,
                sapxep,
                danhmuccha,
                image,
                hienthi,
                mota,
                metatitle,
                metakeywords,
                metadescription,
            });

            await newCategory.save();
            res.status(200).json({ message: 'Thêm danh mục thành công' });
        }catch(error) {
            console.log(error);
            res.status(404).json({ message: error.message });
        }
    }

    /** [GET] /category/:id */
    async editCategory(req, res) {
        try{
            const category = await Category.findById(req.params.id);
            const formatCategory = {
                    ...category.toObject(),
                    lastUpdate: importDate(category.updatedAt)
            }
            const data = {
                category: formatCategory
            }
            res.status(200).json({data})
        }
        catch(err){
            res.status(500).json({message: err})
        }
    }
    
    /** [PUT] /category/:id */
    async updateCategory(req, res) {
        try{
            const categoryId = req.params.id;
            await Category.updateOne({_id: categoryId}, req.body);
            res.status(200).json({
                message: "Cập nhật danh mục thành công :))"
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [DELETE] /category/:id */
    async deleteCategory(req, res) {
        try{
            const categoryId = req.params.id;
            await Category.deleteOne({_id: categoryId});
            res.status(200).json({
                message: "Bạn vừa xóa 1 danh mục!"
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }
}

module.exports = new CategoryController();