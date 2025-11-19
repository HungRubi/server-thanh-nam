const Menu = require("../model/menu.model");
const { importDate } = require("../../util/importDate");
const mongoose = require("mongoose");

/** Đệ quy lấy danh sách tất cả menu con */
const findChildren = async (parentId) => {
    const children = await Menu.find({ danhmuccha: parentId }).lean();

    let all = [...children];
    for (let child of children) {
        const sub = await findChildren(child._id);
        all = all.concat(sub);
    }

    return all;
};

class MenuController {

    /** [GET] /menu */
    async index(req, res) {
        try {
            const searchQuery = req.query.timkiem?.trim() || '';

            let menus;

            if (searchQuery) {
                menus = await Menu.find({
                    name: { $regex: searchQuery, $options: "i" }
                })
                .populate([
                    { path: "danhmuccha" },
                    { path: "category" },
                    { path: "page" },
                ])
                .lean();

                return res.status(200).json({
                    data: {
                        searchType: true,
                        searchMenu: menus.map((p) => ({
                            ...p,
                            formatDate: importDate(p.createdAt)
                        }))
                    }
                });
            }

            menus = await Menu.find()
                .populate([
                    { path: "danhmuccha" },
                    { path: "category" },
                    { path: "page" },
                ])
                .lean();

            return res.status(200).json({
                data: {
                    searchType: false,
                    menuFormat: menus.map((p) => ({
                        ...p,
                        formatDate: importDate(p.createdAt)
                    }))
                }
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            });
        }
    }

    /** [POST] /menu */
    async addMenu(req, res) {
        try {
            const {
                name,
                danhmuccha,
                page,
                category,
                url,
                sapxep,
                hienthi,
                vitri,
            } = req.body;

            if (!name?.trim()) {
                return res.status(400).json({ nameErr: "Tên không được bỏ trống" });
            }
            if (!page?.trim()) {
                return res.status(400).json({ pageErr: "Vui lòng chọn trang nội dung" });
            }
            if (!category?.trim()) {
                return res.status(400).json({ danhmucErr: "Vui lòng chọn danh mục" });
            }
            if (!url?.trim()) {
                return res.status(400).json({ urlErr: "URL không được bỏ trống" });
            }

            let parentId = danhmuccha?.trim() || null;
            if (["", "null", "undefined"].includes(parentId)) {
                parentId = null;
            }

            // Nếu chọn menu cha, kiểm tra menu cha có tồn tại không
            if (parentId) {
                const parentMenu = await Menu.findById(parentId);
                if (!parentMenu) {
                    return res.status(400).json({ danhmucchaErr: "Menu cha không tồn tại" });
                }
            }

            const newMenu = new Menu({
                name,
                danhmuccha: parentId ? new mongoose.Types.ObjectId(parentId) : null,
                page: new mongoose.Types.ObjectId(page),
                category: new mongoose.Types.ObjectId(category),
                url,
                sapxep: sapxep ? Number(sapxep) : 99999,
                hienthi: hienthi?.trim() || "Yes",
                vitri: vitri?.trim() || "Menu chính",
            });

            await newMenu.save();

            return res.status(200).json({ message: "Thêm menu thành công" });

        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Lỗi server vui lòng thử lại sau :((" });
        }
    }


    /** [GET] /menu/:id */
    async editMenu(req, res) {
        try {
            const menu = await Menu.findById(req.params.id).lean();

            return res.status(200).json({ data: { menu } });

        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: err });
        }
    }

    /** [PUT] /menu/:id */
    async updateMenu(req, res) {
        try {
            const menuId = req.params.id;

            const {
                name,
                danhmuccha,
                page,
                category,
                url,
                sapxep,
                hienthi,
                vitri,
            } = req.body;
            if (!name?.trim()) {
                return res.status(400).json({ nameErr: "Tên không được bỏ trống" });
            }
            if (!page?.trim()) {
                return res.status(400).json({ pageErr: "Vui lòng chọn trang nội dung" });
            }
            if (!category?.trim()) {
                return res.status(400).json({ danhmucErr: "Vui lòng chọn danh mục" });
            }
            if (!url?.trim()) {
                return res.status(400).json({ urlErr: "URL không được bỏ trống" });
            }

            const children = await findChildren(menuId);
            const childIds = children.map(c => c._id.toString());

            let parentId = danhmuccha?.trim() || null;

            if (["", "null", "undefined"].includes(parentId)) {
                parentId = null;
            }

            // 1. KHÔNG ĐƯỢC CHỌN CHÍNH NÓ LÀM CHA
            if (parentId && parentId === menuId.toString()) {
                return res.status(400).json({
                    danhmucchaErr: "Không thể chọn chính nó làm danh mục cha"
                });
            }

            // 2. KHÔNG ĐƯỢC CHỌN DANH MỤC CON LÀM CHA
            if (parentId && childIds.includes(parentId)) {
                return res.status(400).json({
                    danhmucchaErr: "Không thể chọn danh mục con làm danh mục cha"
                });
            }

            const updateData = {
                name,
                url,
                danhmuccha: danhmuccha ? new mongoose.Types.ObjectId(danhmuccha) : null,
                page: new mongoose.Types.ObjectId(page),
                category: new mongoose.Types.ObjectId(category),
                sapxep: sapxep ? Number(sapxep) : 99999,
                hienthi: hienthi?.trim() || "Yes",
                vitri: vitri?.trim() || "Menu chính"
            };

            await Menu.updateOne({ _id: menuId }, updateData);

            return res.status(200).json({
                message: "Cập nhật menu thành công"
            });

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            });
        }
    }

    /** [DELETE] /menu/:id */
    async deleteMenu(req, res) {
        try {
            const { id } = req.params;

            await Menu.deleteOne({ _id: id });

            const menus = await Menu.find()
                .populate([
                    { path: "category" },
                    { path: "danhmuccha" },
                    { path: "page" },
                ])
                .lean();

            const menuFormat = menus.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }));

            return res.status(200).json({
                message: "Bạn vừa xóa 1 menu!",
                menuFormat
            });

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            });
        }
    }

    /** [DELETE] /menu/delete-many */
    async deleteManyStore(req, res) {
        try {
            const ids = req.body;

            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    message: "Danh sách ID không hợp lệ!"
                });
            }

            await Menu.deleteMany({ _id: { $in: ids } });

            const menus = await Menu.find()
                .populate([
                    { path: "category" },
                    { path: "danhmuccha" },
                    { path: "page" },
                ])
                .lean();

            const menuFormat = menus.map(p => ({
                ...p,
                formatDate: importDate(p.createdAt)
            }));

            return res.status(200).json({
                menuFormat,
                message: `Bạn vừa xóa ${ids.length} menu!`
            });

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Lỗi server vui lòng thử lại sau :(("
            });
        }
    }

    /** [GET] /menu/filter */
    async filterMenu(req, res) {
        try {
            const { vitri } = req.query;
            console.log(vitri);

            let filter = {};

            if (vitri && vitri !== "Tất cả") {
                filter.vitri = vitri;
            }

            const menus = await Menu.find(filter)
                .populate("danhmuccha")
                .populate("page")
                .populate("category");

            res.status(200).json({ menus });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Lỗi server" });
        }
    }

}

module.exports = new MenuController();
