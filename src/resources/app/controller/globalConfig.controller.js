const GlobalConfig = require("../model/globalConfig.model");
const {importDate} = require("../../util/importDate");
class GlobalConfigController {
    /** [POST] /global */
    async addGlobal(req, res) {
        try{
            const {
                name,
                logo,
                favicon,
                blockIndex,
                slogan,
                notifi1,
                notifi2,
                nameCompany,
                userPost,
                hotline,
                phone,
                address,
                email,
                copyRight,
                linkDKBCT,
                googleMap,
                footer,
                contact
            } = req.body;
            const newConfig = new GlobalConfig({
                name,
                logo,
                favicon,
                blockIndex,
                slogan,
                notifi1,
                notifi2,
                nameCompany,
                userPost,
                hotline,
                phone,
                address,
                email,
                copyRight,
                linkDKBCT,
                googleMap,
                footer,
                contact
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

    /** [GET] /global/:id */
    async editGlobal(req, res) {
        try{
            const global = await GlobalConfig.findById(req.params.id);
            const globalFormat = {
                    ...global.toObject(),
                    lastUpdate: importDate(global.updatedAt)
            }
            const data = {
                offer: globalFormat
            }
            res.status(200).json({data})
        }
        catch(err){
            console.log(err);
            res.status(500).json({message: err})
        }
    }
    
    /** [PUT] /global/:id */
    async updateGlobal(req, res) {
        try{
            const globalId = req.params.id;
            await GlobalConfig.updateOne({_id: globalId}, req.body);
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

module.exports = new GlobalConfigController();