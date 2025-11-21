const SeoConfig = require("../model/seoConfig.model");

class SeoConfigController {

    /** [GET] /seo */
    async editSeo(req, res) {
        try {
            let seo = await SeoConfig.findOne();

            // Nếu chưa có bản ghi thì tạo rỗng
            if (!seo) {
                seo = await SeoConfig.create({});
            }

            res.status(200).json({
                data: seo
            });

        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Lỗi server" });
        }
    }

    /** [PUT] /seo */
    async updateSeo(req, res) {
        try {
            const updated = await SeoConfig.findOneAndUpdate(
                {},            // tìm document duy nhất
                req.body,      // cập nhật theo body
                { new: true, upsert: true }   // tạo mới nếu chưa tồn tại
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

module.exports = new SeoConfigController();
