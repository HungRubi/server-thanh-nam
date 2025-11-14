const Category = require('../model/category.model');

class CategoryController {


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

    
}

module.exports = new CategoryController();