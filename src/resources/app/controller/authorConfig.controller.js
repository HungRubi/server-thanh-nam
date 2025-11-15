const AuthorConfig = require("../model/authorConfig.model");

class AuthorConfigController {
    /** [POST] /author */
    async addAuthor(req, res) {
        try{
            const {
                name,
                avatar,
            } = req.body;
            const newConfig = new AuthorConfig({
                name,
                avatar,
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

    /** [GET] /author/:id */
    async editAuthor(req, res) {
        try{
            const author = await AuthorConfig.findById(req.params.id);
            const data = { author }
            res.status(200).json({data})
        }
        catch(err){
            console.log(err);
            res.status(500).json({message: err})
        }
    }
    
    /** [PUT] /author/:id */
    async updateAuthor(req, res) {
        try{
            const authorId = req.params.id;
            await AuthorConfig.updateOne({_id: authorId}, req.body);
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

module.exports = new AuthorConfigController();