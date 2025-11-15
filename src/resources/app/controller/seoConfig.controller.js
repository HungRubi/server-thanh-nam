const SeoConfig = require("../model/seoConfig.model");

class SeoConfigController {
    /** [POST] /seo */
    async addSeo(req, res) {
        try{
            const {
                metaTitle,
                metaKeywords,
                metaDescription,
                googleAnalyticCode,
            } = req.body;
            const newConfig = new SeoConfig({
                metaTitle,
                metaKeywords,
                metaDescription,
                googleAnalyticCode,
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

    /** [GET] /seo/:id */
    async editSeo(req, res) {
        try{
            const seo = await SeoConfig.findById(req.params.id);
            const data = { seo }
            res.status(200).json({data})
        }
        catch(err){
            console.log(err);
            res.status(500).json({message: err})
        }
    }
    
    /** [PUT] /seo/:id */
    async updateSeo(req, res) {
        try{
            const seoId = req.params.id;
            await SeoConfig.updateOne({_id: seoId}, req.body);
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

module.exports = new SeoConfigController();