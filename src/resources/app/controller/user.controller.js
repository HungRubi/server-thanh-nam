const User = require('../model/user.model');
const bcrypt = require('bcrypt');
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
                .sort({createdAt: -1})
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
                .sort({createdAt: -1})
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
                confirm,
                email,
                matkhau,
                sodienthoai
            } = req.body;
            if(!hovaten.trim()) {
                return res.status(400).json({
                    nameErr: "Họ và tên không được bỏ trống"
                });
            }
            if(!tendangnhap.trim()) {
                return res.status(400).json({
                    accountErr: "Tài khoản không được bỏ trống"
                });
            }
            const existingAccount = await User.findOne({tendangnhap: tendangnhap});
            if (existingAccount) {
                return res.status(400).json({
                    accountErr: "Tài khoản đã được đăng ký rồi"
                });
            }
            if(!email.trim()) {
                return res.status(400).json({
                    emailErr: "Email này không được bỏ trống"
                });
            }
            const existingEmail = await User.findOne({email: email});
            if (existingEmail) {
                return res.status(400).json({
                    emailErr: "Email đã được đăng ký rồi"
                });
            }
            if(!matkhau.trim()) {
                return res.status(400).json({
                    passwordErr: "Mật khẩu không được bỏ trống"
                });
            }
            if(!confirm.trim()) {
                return res.status(400).json({
                    passwordErr: "Mật khẩu này không được bỏ trống"
                });
            }
            if(matkhau !== confirm){
                return res.status(404).json({
                    passwordErr: "Mật khẩu không trùng khớp"
                });
            }
            const passwordRegex = /^[A-Z][A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{7,}$/;

            if (!passwordRegex.test(matkhau)) {
                return res.status(400).json({
                    passwordErr: "Mật khẩu phải có ít nhất 8 ký tự, ký tự đầu viết hoa và chứa ít nhất 1 ký tự đặc biệt"
                });
            }
            const hashPassword = await bcrypt.hash(matkhau, 10);
            const newUser = new User({
                hovaten,
                tendangnhap,
                email,
                matkhau: hashPassword,
                sodienthoai
            });
            await newUser.save();
            return res.status(200).json({
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
            const user = await User.findById(req.params.id).lean();
            res.status(200).json({user: user})
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
            const {
                hovaten,
                tendangnhap,
                confirm,
                email,
                matkhau,
                sodienthoai
            } = req.body;
            if(!hovaten.trim()) {
                return res.status(400).json({
                    nameErr: "Họ và tên không được bỏ trống"
                });
            }
            if(!tendangnhap.trim()) {
                return res.status(400).json({
                    accountErr: "Tài khoản không được bỏ trống"
                });
            }
            const existingAccount = await User.findOne({tendangnhap: tendangnhap});
            if (existingAccount && existingAccount._id.toString() !== userId) {
                return res.status(400).json({
                    accountErr: "Tài khoản đã được đăng ký rồi"
                });
            }
            if(!email.trim()) {
                return res.status(400).json({
                    emailErr: "Email này không được bỏ trống"
                });
            }
            const existingEmail = await User.findOne({email: email});
            if (existingEmail && existingEmail._id.toString() !== userId) {
                return res.status(400).json({
                    emailErr: "Email đã được đăng ký rồi"
                });
            }
            if(!matkhau.trim()) {
                return res.status(400).json({
                    passwordErr: "Mật khẩu không được bỏ trống"
                });
            }
            if(!confirm.trim()) {
                return res.status(400).json({
                    passwordErr: "Mật khẩu này không được bỏ trống"
                });
            }
            if(matkhau !== confirm){
                return res.status(404).json({
                    passwordErr: "Mật khẩu không trùng khớp"
                });
            }
            const passwordRegex = /^[A-Z][A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{7,}$/;

            if (!matkhau.startsWith('$2') && !passwordRegex.test(matkhau)) {
                return res.status(400).json({
                    passwordErr: "Mật khẩu phải có ít nhất 8 ký tự, ký tự đầu viết hoa và chứa ít nhất 1 ký tự đặc biệt"
                });
            }
            const hashPassword = await bcrypt.hash(matkhau, 10); 
            await User.updateOne(
                { _id: userId },
                {
                    hovaten,
                    tendangnhap,
                    email,
                    sodienthoai,
                    matkhau: hashPassword,
                }
            );
            res.status(200).json({
                message: "Cập nhật user thành công :))"
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
            const users = await User.find().lean();
            const userFormat = users.map(p => ({
                    ...p,
                    formatDate: importDate(p.createdAt)
                }))
            res.status(200).json({
                users: userFormat,
                message: "Bạn vừa xóa 1 user!"
            })
        }catch(error) {
            console.log(error);
            res.status(404).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            })
        }
    }

    /** [DELETE] /user/delete-many */
    async deleteManyUser(req, res) {
        try {
            const ids  = req.body; 

            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    message: "Danh sách ID không hợp lệ!"
                });
            }

            await User.deleteMany({ _id: { $in: ids } });

            const user = await User.find().lean();
            const userFormat = user.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }));

            res.status(200).json({
                users: userFormat,
                message: `Bạn vừa xóa ${ids.length} user!`
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            });
        }
    }
}

module.exports = new userController();
