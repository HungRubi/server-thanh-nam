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
                .sort({createdAt: -1})
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
                .sort({createdAt: -1})
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
    
    /** [POST] /widget */
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
            if(!name.trim()) {
                return res.status(400).json({
                    nameErr: "Chưa nhập tên kìa bro"
                })
            }
            const hienthi1 = hienthi.trim() || "Yes"
            const vitri1 = vitri.trim() || "Banner homepage"
            const newWidget = new Widget({
                name,
                link,
                sapxep,
                vitri1,
                image,
                hienthi1,
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
    
    /** [GET] /widget/:id */
    async editWidget(req, res) {
        try{
            const widget = await Widget.findById(req.params.id);
            const widgetFormat = {
                    ...widget.toObject(),
                    lastUpdate: importDate(widget.updatedAt)
            }
            const data = {
                content: widgetFormat
            }
            res.status(200).json({data})
        }
        catch(err){
            console.log(err);
            res.status(500).json({message: err})
        }
    }

    /** [PUT] /widget/:id */
    async updateWidget(req, res) {
        try{
            const widgettId = req.params.id;
            if(!req.body.name.trim()) {
                return res.status(400).json({
                    nameErr: 'Tên không được để trống!'
                })
            }
            await Widget.updateOne({_id: widgettId}, req.body);
            res.status(200).json({
                message: "Cập nhật widget thành công :))"
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [DELETE] /widget/:id */
    async deleteWidget(req, res) {
        try{
            const widgetId = req.params.id;
            await Widget.deleteOne({_id: widgetId});
            const widget = await Widget.find()
                .lean();
    
            const widgetFormat = widget.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))
            res.status(200).json({
                widgetFormat,
                message: "Bạn vừa xóa 1 widget!"
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [DELETE] /widget/delete-many */
    async deleteManyWidget(req, res) {
        try {
            const ids  = req.body; 

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    message: "Danh sách ID không hợp lệ!"
                });
            }

            await Widget.deleteMany({ _id: { $in: ids } });

            const widget = await Widget.find().lean();
            const widgetFormat = widget.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }));

            res.status(200).json({
                widgetFormat,
                message: `Bạn vừa xóa ${ids.length} tin tức!`
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            });
        }
    }

    
}

module.exports = new WidgetController();