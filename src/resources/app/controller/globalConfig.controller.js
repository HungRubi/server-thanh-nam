const GlobalConfig = require("../model/globalConfig.model");
const {importDate} = require("../../util/importDate");
class GlobalConfigController {
    async getGlobalConfig(req, res) {
        try {
            let global = await GlobalConfig.findOne();

            if (!global) {
                global = await GlobalConfig.create({});
            }

            const globalFormat = {
                ...global.toObject(),
                lastUpdate: importDate(global.updatedAt)
            };

            res.status(200).json({ data: globalFormat });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Lỗi server" });
        }
    }


    async updateGlobalConfig(req, res) {
        try {
            const updatedGlobal = await GlobalConfig.findOneAndUpdate(
                {},            
                req.body,      
                { new: true }  
            );

            if (!updatedGlobal) {
                return res.status(404).json({ message: "Chưa có cấu hình để cập nhật" });
            }

            res.status(200).json({ 
                data: updatedGlobal,
                message: 'Cập nhật thành công!'
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Lỗi server" });
        }
    }


} 

module.exports = new GlobalConfigController();