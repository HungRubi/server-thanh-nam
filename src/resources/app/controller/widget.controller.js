const Widget = require("../model/widget.model");
const {importDate} = require("../../util/importDate");

class WidgetController {

    /** [GET] /widget */
    async index(req, res) {
        try{
            const searchQuery = req.query.timkiem?.trim() || '';
            if(searchQuery){
                const widget = await Widget.find({
                    name: { $regex: searchQuery, $options: 'i' }
                })
                .lean();
                const widgetFormat = widget.map(p => ({
                    ...p,
                    formatDate: importDate(p.createdAt)
                }))
                const data = {
                    searchType: true,
                    searchNew: widgetFormat,
                }
                return res.status(200).json({data})
            }
            const widget = await Widget.find()
                .lean();
    
            const widgetFormat = widget.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))

            const totalWidget = await Widget.countDocuments();
            const totalPage = Math.ceil(totalWidget / 10);
            
            const data = {
                widgetFormat,
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
    async addWidget(req, res) {
        try {
            const {
                name,
                link,
                sapxep,
                vitri,
                image,
                hienthi,
                description
            } = req.body;

            const newWidget = new Widget({
                name,
                link,
                sapxep,
                vitri,
                image,
                hienthi,
                description
            });

            await newWidget.save();

            return res.status(200).json({
                message: "Thêm trang widget thành công",
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

module.exports = new WidgetController();