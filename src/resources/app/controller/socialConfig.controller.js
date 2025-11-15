const SocialConfig = require("../model/socialConfig.model");

class SocialConfigController {
    /** [POST] /author */
    async addSocial(req, res) {
        try{
            const {
                iamge,
                facebook,
                facebookPage,
                twitter,
                instagram,
                pinterest,
                youtube
            } = req.body;
            const newSocial = new SocialConfig({
                iamge,
                facebook,
                facebookPage,
                twitter,
                instagram,
                pinterest,
                youtube
            })
            await newSocial.save();
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

    /** [GET] /author/:id */
    async editSocial(req, res) {
        try{
            const social = await SocialConfig.findById(req.params.id);
            const data = { social }
            res.status(200).json({data})
        }
        catch(err){
            console.log(err);
            res.status(500).json({message: err})
        }
    }
    
    /** [PUT] /author/:id */
    async updateSocial(req, res) {
        try{
            const socialId = req.params.id;
            await SocialConfig.updateOne({_id: socialId}, req.body);
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

module.exports = new SocialConfigController();