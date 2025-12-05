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
                .sort({createdAt: -1})
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
                .sort({createdAt: -1})
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
            if(tendanhmuc === '') {
                return res.status(400).json({
                    tendanhmucErr: "Tên danh mục không được bỏ trống"
                })
            }
            const exitsTenDanhMuc = await Category.findOne({tendanhmuc: tendanhmuc})
            if(exitsTenDanhMuc) {
                return res.status(400).json({
                    tendanhmucErr: "Tên danh mục đã tồn tại"
                })
            }
            if(slug === '') {
                return res.status(400).json({
                    slugErr: "slug không được bỏ trống"
                })
            }
            const exitsSlug = await Category.findOne({slug: slug})
            if(exitsSlug) {
                return res.status(400).json({
                    slugErr: "Slug đã tồn tại"
                })
            }
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
            return res.status(200).json({ message: 'Thêm danh mục thành công!' });
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
        try {
            const categoryId = req.params.id;

            if (!req.body.tendanhmuc?.trim()) {
                return res.status(400).json({ tendanhmucErr: "Tên danh mục không được bỏ trống" });
            }

            const existsTenDanhMuc = await Category.findOne({ tendanhmuc: req.body.tendanhmuc });
            if (existsTenDanhMuc && existsTenDanhMuc._id.toString() !== categoryId) {
                return res.status(400).json({ tendanhmucErr: "Tên danh mục đã tồn tại" });
            }

            if (!req.body.slug?.trim()) {
                return res.status(400).json({ slugErr: "Slug không được bỏ trống" });
            }

            const existsSlug = await Category.findOne({ slug: req.body.slug });
            if (existsSlug && existsSlug._id.toString() !== categoryId) {
                return res.status(400).json({ slugErr: "Slug đã tồn tại" });
            }

            await Category.updateOne({ _id: categoryId }, req.body);

            return res.status(200).json({ message: "Cập nhật danh mục thành công!" });

        } catch (error) {
            console.log(error);
            res.status(500).json({ 
                message: "Lỗi server vui lòng thử lại sau :((" 
            });
        }
    }

    /** [DELETE] /category/:id */
    async deleteCategory(req, res) {
        try{
            const categoryId = req.params.id;
            await Category.deleteOne({_id: categoryId});
            const category = await Category.find().lean();
            const categoryFormat = category.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))
            res.status(200).json({
                categoryFormat,
                message: "Bạn vừa xóa 1 danh mục!"
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [DELETE] /category/delete-many */
    async deleteManyCategory(req, res) {
        try {
             const ids  = req.body;  // ✅ phải đúng key mà client gửi

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    message: "Danh sách ID không hợp lệ!"
                });
            }

            await Category.deleteMany({ _id: { $in: ids } });

            const category = await Category.find().lean();
            const categoryFormat = category.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }));

            res.status(200).json({
                categoryFormat,
                message: `Bạn vừa xóa ${ids.length} danh mục!`
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            });
        }
    }

}

module.exports = new CategoryController();