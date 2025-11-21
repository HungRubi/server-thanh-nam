const SocialConfig = require("../model/socialConfig.model");

class SocialConfigController {

    /** [GET] /social */
    async editSocial(req, res) {
        try {
            let social = await SocialConfig.findOne();

            if (!social) {
                social = await SocialConfig.create({});
            }

            res.status(200).json({
                data: social
            });

        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Lỗi server" });
        }
    }

    /** [PUT] /social */
    async updateSocial(req, res) {
        try {
            const updated = await SocialConfig.findOneAndUpdate(
                {},                
                req.body,           
                { new: true, upsert: true }  
            );

            res.status(200).json({
                message: "Cập nhật thành công!",
                data: updated
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau"
            });
        }
    }
}

module.exports = new SocialConfigController();
