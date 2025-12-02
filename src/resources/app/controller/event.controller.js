const Event = require("../model/event.model");
const {importDate} = require("../../util/importDate");
class EventController {

    /** [GET] /event */
    async index  (req, res) {
        try{
            const searchQuery = req.query.timkiem?.trim() || '';
            if(searchQuery){
                const event = await Event.find({
                    tendanhmuc: { $regex: searchQuery, $options: 'i' }
                })
                .lean();
                const eventFormat = event.map(p => ({
                    ...p,
                    formatDate: importDate(p.createdAt)
                }))
                const data = {
                    searchType: true,
                    searchEvent: eventFormat,
                }
                return res.status(200).json({data})
            }
            const categories = await Event.find()
                .lean();
    
            const eventFormat = categories.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))

            const data = {
                eventFormat,
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

    /** [POST] /event */
    async add(req, res) {
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
            const exitsTenDanhMuc = await Event.findOne({tendanhmuc: tendanhmuc})
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
            const exitsSlug = await Event.findOne({slug: slug})
            if(exitsSlug) {
                return res.status(400).json({
                    slugErr: "Slug đã tồn tại"
                })
            }
            const newCategory = new Event({
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
            return res.status(200).json({ message: 'Thêm event thành công!' });
        }catch(error) {
            console.log(error);
            res.status(404).json({ message: error.message });
        }
    }

    /** [GET] /event/:id */
    async edit(req, res) {
        try{
            const event = await Event.findById(req.params.id);
            const formatCategory = {
                    ...event.toObject(),
                    lastUpdate: importDate(event.updatedAt)
            }
            const data = {
                event: formatCategory
            }
            res.status(200).json({data})
        }
        catch(err){
            res.status(500).json({message: err})
        }
    }

    /** [PUT] /event/:id */
    async update(req, res) {
        try {
            const categoryId = req.params.id;

            if (!req.body.tendanhmuc?.trim()) {
                return res.status(400).json({ tendanhmucErr: "Tên danh mục không được bỏ trống" });
            }

            const existsTenDanhMuc = await Event.findOne({ tendanhmuc: req.body.tendanhmuc });
            if (existsTenDanhMuc && existsTenDanhMuc._id.toString() !== categoryId) {
                return res.status(400).json({ tendanhmucErr: "Tên danh mục đã tồn tại" });
            }

            if (!req.body.slug?.trim()) {
                return res.status(400).json({ slugErr: "Slug không được bỏ trống" });
            }

            const existsSlug = await Event.findOne({ slug: req.body.slug });
            if (existsSlug && existsSlug._id.toString() !== categoryId) {
                return res.status(400).json({ slugErr: "Slug đã tồn tại" });
            }

            await Event.updateOne({ _id: categoryId }, req.body);

            return res.status(200).json({ message: "Cập nhật event thành công!" });

        } catch (error) {
            console.log(error);
            res.status(500).json({ 
                message: "Lỗi server vui lòng thử lại sau :((" 
            });
        }
    }

    /** [DELETE] /event/:id */
    async delete(req, res) {
        try{
            const categoryId = req.params.id;
            await Event.deleteOne({_id: categoryId});
            const category = await Event.find().lean();
            const eventFormat = category.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))
            res.status(200).json({
                eventFormat,
                message: "Bạn vừa xóa 1 event!"
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [DELETE] /event/delete-many */
    async deleteManyCategory(req, res) {
        try {
            const ids  = req.body;
            console.log(ids)  

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    message: "Danh sách ID không hợp lệ!"
                });
            }

            await Event.deleteMany({ _id: { $in: ids } });

            const category = await Event.find().lean();
            const eventFormat = category.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }));

            res.status(200).json({
                eventFormat,
                message: `Bạn vừa xóa ${ids.length} event!`
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            });
        }
    }
}

module.exports = new EventController();