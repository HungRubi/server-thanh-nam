const User = require('../model/user.model');
const { importDate } = require('../../util/importDate');
class userController {

    /** [GET] /user */
    async index  (req, res) {
        try{
            const searchQuery = req.query.timkiem?.trim() || '';
            if(searchQuery){
                const user = await User.find({
                    hovaten: { $regex: searchQuery, $options: 'i' }
                })
                .lean();
                const userFormat = user.map(p => ({
                    ...p,
                    formatDate: importDate(p.createdAt)
                }))
                const data = {
                    searchType: true,
                    searchUser: userFormat,
                }
                return res.status(200).json({data})
            }
            const users = await User.find()
                .lean();
    
            const userFormat = users.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }))

            const totalUser = await User.countDocuments();
            const totalPage = Math.ceil(totalUser / 10);
            
            const data = {
                userFormat,
                totalPage,
                searchType: false,
            }
            return res.status(200).json({data});
        }catch(error){
            console.log(error);
            return res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [POST] /user */
    async addUser(req, res) {
        try{
            const {
                hovaten,
                tendangnhap,
                email,
                matkhau,
                sodienthoai
            } = req.body;
            const existingEmail = await User.findOne({email: email});
            if (existingEmail) {
                return res.status(400).json({
                    message: "Email đã được đăng ký rồi"
                });
            }
            const existingAccount = await User.findOne({tendangnhap: tendangnhap});
            if (existingAccount) {
                return res.status(400).json({
                    message: "Tài khoản đã được đăng ký rồi"
                });
            }
            const newUser = new User({hovaten,tendangnhap,email,matkhau,sodienthoai});
            await newUser.save();
            return res.status(201).json({
                message: "Tạo tài khoản thành công!"
            });
        }catch(error){
            console.log(error);
            return res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [GET] /user/:id */
    async editUser(req, res) {
        try{
            const user = await User.findById(req.params.id);
            const userFormat = {
                    ...user.toObject(),
                    lastUpdate: importDate(user.updatedAt)
            }
            const data = {
                user: userFormat
            }
            res.status(200).json({data})
        }
        catch(err){
            console.log(err);
            res.status(500).json({message: err})
        }
    }

    /** [PUT] /user/:id */
    async updateUser(req, res) {
        try{
            const userId = req.params.id;
            const existingEmail = await User.findOne({email: req.body.email});
            if (existingEmail) {
                return res.status(400).json({
                    message: "Email đã tồn tại"
                });
            }
            const existingAccount = await User.findOne({tendangnhap: req.body.tendangnhap});
            if (existingAccount) {
                return res.status(400).json({
                    message: "Tài khoản đã tồn tại"
                });
            }
            await User.updateOne({_id: userId}, req.body);
            res.status(200).json({
                message: "Cập nhật danh mục thành công :))"
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [DELETE] /user/:id */
    async deleteUser(req, res) {
        try{
            const userId = req.params.id;
            await User.deleteOne({_id: userId});
            res.status(200).json({
                message: "Bạn vừa xóa 1 user!"
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }
}

module.exports = new userController();
