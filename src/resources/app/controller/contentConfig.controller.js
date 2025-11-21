const ContentConfig = require("../model/contentConfig.model");

class ContentConfigController {

    /** [GET] /content */
    async editContent(req, res) {
        try {
            let content = await ContentConfig.findOne();

            // Nếu chưa có document → tạo rỗng
            if (!content) {
                content = await ContentConfig.create({});
            }

            res.status(200).json({
                data: content
            });

        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Lỗi server" });
        }
    }

    /** [PUT] /content */
    async updateContent(req, res) {
        try {
            const updated = await ContentConfig.findOneAndUpdate(
                {},             // chỉ có 1 document duy nhất
                req.body,       // cập nhật dữ liệu
                { new: true, upsert: true }  // tạo nếu chưa có
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

module.exports = new ContentConfigController();
