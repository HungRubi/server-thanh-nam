const ContentConfig = require("../model/contentConfig.model")
class ContentConfigController {
    
    /** [POST] /content-config */
    async addContent(req, res) {
        try{
            const {
                name,
                description,
                howToApply,
                FAQs
            } = req.body;
            const newConfig = new ContentConfig({
                name,
                description,
                howToApply,
                FAQs
            })
            await newConfig.save();
            return res.status(200).json({
                message: "Thêm thành công"
            })
        }catch(error) {
            console.log(error);
            return res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [GET] /content-config/:id */
    async editContent(req, res) {
        try{
            const content = await ContentConfig.findById(req.params.id);
            const data = { content }
            res.status(200).json({data})
        }
        catch(err){
            console.log(err);
            res.status(500).json({message: err})
        }
    }
    
    /** [PUT] /content-config/:id */
    async updateContent(req, res) {
        try{
            const contentId = req.params.id;
            await ContentConfig.updateOne({_id: contentId}, req.body);
            res.status(200).json({
                message: "Cập nhật thành công :))"
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

} 

module.exports = new ContentConfigController();