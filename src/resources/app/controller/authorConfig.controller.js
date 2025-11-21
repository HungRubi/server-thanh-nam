const AuthorConfig = require("../model/authorConfig.model");

class AuthorConfigController {

    /** [GET] /author */
    async editAuthor(req, res) {
        try {
            // Lấy document duy nhất
            let author = await AuthorConfig.findOne();

            // Nếu chưa có thì tạo mới document mặc định (rỗng)
            if (!author) {
                author = await AuthorConfig.create({});
            }

            res.status(200).json({
                data: author
            });

        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Lỗi server" });
        }
    }

    /** [PUT] /author */
    async updateAuthor(req, res) {
        try {
            const updated = await AuthorConfig.findOneAndUpdate(
                {},             // không điều kiện → document duy nhất
                req.body,       // dữ liệu FE gửi lên
                { new: true, upsert: true } 
                // upsert: true → nếu chưa có document thì tự tạo
            );

            res.status(200).json({
                message: "Cập nhật thành công!",
                data: updated,
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau"
            });
        }
    }
}

module.exports = new AuthorConfigController();
