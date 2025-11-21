const File = require("../model/file.model");
const fs = require("fs");
const path = require("path");
const {importDate} = require("../../util/importDate")
class FileController {

    async getAllFoldersAndFiles(req, res) {
        try {
            const roots = await File.find({ type: "folder", parentId: null }).lean();

            const rootFiles = await File.find({ type: "file", parentId: null }).lean();

            const fetchChildren = async (parent) => {
                const childrenFolders = await File.find({ type: "folder", parentId: parent._id }).lean();
                const childrenFiles = await File.find({ type: "file", parentId: parent._id }).lean();

                const children = [];

                for (let folder of childrenFolders) {
                    const sub = await fetchChildren(folder);
                    children.push({ 
                        ...folder, 
                        children: sub, 
                        formatDate: importDate(folder.createdAt) 
                    });
                }

                for (let file of childrenFiles) {
                    children.push({
                        ...file,
                        formatDate: importDate(file.createdAt)
                    });
                }

                return children;
            };

            const result = [];

            for (let root of roots) {
                const children = await fetchChildren(root);
                result.push({ 
                    ...root, 
                    children, 
                    formatDate: importDate(root.createdAt)
                });
            }

            for (let file of rootFiles) {
                result.push({
                    ...file,
                    formatDate: importDate(file.createdAt)
                });
            }

            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async createFolder(req, res) {
        try {
            const { name, parentId } = req.body;

            const rootUploadPath = path.join(process.cwd(), "src", "upload");

            let folderPath; 
            let dbPath; 

            if (parentId) {
                const parent = await File.findById(parentId);
                if (!parent) return res.status(400).json({ message: "Parent folder không tồn tại" });

                // parent.path trong DB luôn có dạng "upload/abc", nhưng rootUploadPath đã là src/upload
                folderPath = path.join(rootUploadPath, parent.path.replace(/^upload[\\/]/, ""), name);
                dbPath = path.join(parent.path, name).replace(/\\/g, "/"); // lưu DB tương đối
            } else {
                folderPath = path.join(rootUploadPath, name);
                dbPath = `upload/${name}`;
            }

            // === XỬ LÝ TÊN TRÙNG ===
            let counter = 1;
            while (fs.existsSync(folderPath)) {
                const suffix = `(${counter})`;
                if (parentId) {
                    folderPath = path.join(rootUploadPath, parent.path.replace(/^upload[\\/]/, ""), `${name}${suffix}`);
                    dbPath = path.join(parent.path, `${name}${suffix}`).replace(/\\/g, "/");
                } else {
                    folderPath = path.join(rootUploadPath, `${name}${suffix}`);
                    dbPath = `upload/${name}${suffix}`;
                }
                counter++;
            }

            // Tạo folder nếu chưa tồn tại
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            const newFolder = await File.create({
                name: path.basename(dbPath), // tên folder đã chỉnh sửa nếu trùng
                type: "folder",
                path: dbPath,
                parentId: parentId || null,
            });

            // Lấy tất cả folder + file để trả về FE
            const fetchChildren = async (parent) => {
                const childrenFolders = await File.find({ type: "folder", parentId: parent._id }).lean();
                const childrenFiles = await File.find({ type: "file", parentId: parent._id }).lean();

                const children = [];

                for (let folder of childrenFolders) {
                    const sub = await fetchChildren(folder);
                    children.push({ ...folder, children: sub, formatDate: importDate(folder.createdAt) });
                }

                for (let file of childrenFiles) {
                    children.push({ ...file, formatDate: importDate(file.createdAt) });
                }

                return children;
            };

            const roots = await File.find({ type: "folder", parentId: null }).lean();
            const rootFiles = await File.find({ type: "file", parentId: null }).lean();

            const result = [];

            for (let root of roots) {
                const children = await fetchChildren(root);
                result.push({ ...root, children, formatDate: importDate(root.createdAt) });
            }

            for (let file of rootFiles) {
                result.push({ ...file, formatDate: importDate(file.createdAt) });
            }

            return res.json({
                message: "Tạo folder thành công",
                folder: result,
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: error.message });
        }
    }

    async uploadFile(req, res) {
        try {
            let { parentId } = req.body;
            if (!parentId || parentId === "null") parentId = null;

            const fileData = req.file;
            if (!fileData) return res.status(400).json({ error: "Chưa có file để upload" });

            const rootUploadPath = path.join(process.cwd(), "src", "upload");

            // Xác định folder thực tế và đường dẫn DB
            let parentPath = rootUploadPath;
            let dbParentPath = "upload";

            if (parentId) {
                const parent = await File.findById(parentId);
                if (!parent) return res.status(400).json({ error: "Parent folder không tồn tại" });

                parentPath = path.join(rootUploadPath, parent.path.replace(/^upload[\\/]/, ""));
                dbParentPath = parent.path;
            }

            // đảm bảo thư mục tồn tại
            if (!fs.existsSync(parentPath)) fs.mkdirSync(parentPath, { recursive: true });

            // Xử lý trùng tên file
            let fileName = fileData.originalname;
            let filePath = path.join(parentPath, fileName);
            let dbPath = path.join(dbParentPath, fileName).replace(/\\/g, "/");

            const ext = path.extname(fileName);
            const nameWithoutExt = path.basename(fileName, ext);
            let counter = 1;

            while (fs.existsSync(filePath)) {
                fileName = `${nameWithoutExt}(${counter})${ext}`;
                filePath = path.join(parentPath, fileName);
                dbPath = path.join(dbParentPath, fileName).replace(/\\/g, "/");
                counter++;
            }

            // di chuyển file từ multer (tmp) sang folder đúng
            fs.renameSync(fileData.path, filePath);

            // lưu vào DB
            const newFile = await File.create({
                name: fileName,
                type: "file",
                path: dbPath,
                parentId: parentId || null,
                size: fileData.size,
                mimeType: fileData.mimetype
            });

            // Lấy tất cả folder + file trả về FE
            const fetchChildren = async (parent) => {
            const childrenFolders = await File.find({ type: "folder", parentId: parent._id }).lean();
            const childrenFiles = await File.find({ type: "file", parentId: parent._id }).lean();
            const children = [];

            for (let folder of childrenFolders) {
                const sub = await fetchChildren(folder);
                children.push({ ...folder, children: sub, formatDate: importDate(folder.createdAt) });
            }

            for (let file of childrenFiles) {
                children.push({ ...file, formatDate: importDate(file.createdAt) });
            }
            return children;
            };

            const roots = await File.find({ type: "folder", parentId: null }).lean();
            const rootFiles = await File.find({ type: "file", parentId: null }).lean();
            const result = [];

            for (let root of roots) {
            const children = await fetchChildren(root);
            result.push({ ...root, children, formatDate: importDate(root.createdAt) });
            }

            for (let file of rootFiles) {
            result.push({ ...file, formatDate: importDate(file.createdAt) });
            }

            return res.status(200).json({
            message: "Tải file lên thành công",
            file: newFile,
            list: result
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                error: "Server bị chập điện liên hệ Hùng để fix"
            });
        }
    }

    async  updateFileName(req, res) {
        try {
            const { fileId, newName } = req.body;

            if (!fileId || !newName?.trim()) {
                return res.status(400).json({ message: "Thiếu fileId hoặc newName" });
            }

            const file = await File.findById(fileId);
            if (!file) return res.status(400).json({ message: "File/Folder không tồn tại" });

            // Lấy tất cả file/folder cùng parent để kiểm tra trùng
            const siblings = await File.find({ 
                parentId: file.parentId,
                _id: { $ne: fileId } 
            }).select("name");

            let baseName = newName.trim();
            let finalName = baseName;
            let counter = 1;

            const isNameTaken = (name) => siblings.some(s => s.name === name);

            while (isNameTaken(finalName)) {
                finalName = `${baseName}(${counter})`;
                counter++;
            }

            const rootUploadPath = path.join(process.cwd(), "src", "upload");

            // Hàm cập nhật path cho tất cả con nếu là folder
            async function updateChildPaths(parent, oldParentPath, newParentPath) {
                const children = await File.find({ parentId: parent._id });
                for (let child of children) {
                    // Cập nhật path trên DB
                    if (child.type === "file") {
                        const oldPath = path.join(rootUploadPath, child.path.replace(/^upload[\\/]/, ""));
                        const newPath = oldPath.replace(oldParentPath, newParentPath);
                        if (fs.existsSync(oldPath)) fs.renameSync(oldPath, newPath);
                        child.path = path.join("upload", newPath.replace(rootUploadPath + path.sep, "")).replace(/\\/g, "/");
                    } else if (child.type === "folder") {
                        const childOldPath = path.join(rootUploadPath, child.path.replace(/^upload[\\/]/, ""));
                        const childNewPath = childOldPath.replace(oldParentPath, newParentPath);
                        child.path = path.join("upload", childNewPath.replace(rootUploadPath + path.sep, "")).replace(/\\/g, "/");
                        await updateChildPaths(child, childOldPath, childNewPath);
                    }
                    await child.save();
                }
            }

            if (file.type === "file") {
                // File: đổi tên file và path
                const parentPath = file.parentId 
                    ? path.join(rootUploadPath, (await File.findById(file.parentId)).path.replace(/^upload[\\/]/, ""))
                    : rootUploadPath;

                const ext = path.extname(file.name);
                const oldPath = path.join(parentPath, file.name);
                const newPath = path.join(parentPath, finalName + ext);

                if (fs.existsSync(oldPath)) fs.renameSync(oldPath, newPath);
                file.name = finalName;
                file.path = path.join(file.parentId ? (await File.findById(file.parentId)).path : "upload", finalName + ext).replace(/\\/g, "/");
                await file.save();
            } else if (file.type === "folder") {
                // Folder: đổi tên folder và cập nhật path tất cả con
                const oldFolderPath = path.join(rootUploadPath, file.path.replace(/^upload[\\/]/, ""));
                const parentPath = file.parentId
                    ? path.join(rootUploadPath, (await File.findById(file.parentId)).path.replace(/^upload[\\/]/, ""))
                    : rootUploadPath;
                const newFolderPath = path.join(parentPath, finalName);

                if (fs.existsSync(oldFolderPath)) fs.renameSync(oldFolderPath, newFolderPath);

                const oldPathForDB = file.path; // upload/oldFolder
                const newPathForDB = path.join(file.parentId ? (await File.findById(file.parentId)).path : "upload", finalName).replace(/\\/g, "/");
                file.name = finalName;
                file.path = newPathForDB;
                await file.save();

                // Cập nhật path tất cả con
                await updateChildPaths(file, oldFolderPath, newFolderPath);
            }

            // Lấy toàn bộ cây file + folder trả về FE
            const fetchChildren = async (parent) => {
                const childrenFolders = await File.find({ type: "folder", parentId: parent._id }).lean();
                const childrenFiles = await File.find({ type: "file", parentId: parent._id }).lean();
                const children = [];

                for (let folder of childrenFolders) {
                    const sub = await fetchChildren(folder);
                    children.push({ ...folder, children: sub, formatDate: importDate(folder.createdAt) });
                }

                for (let f of childrenFiles) {
                    children.push({ ...f, formatDate: importDate(f.createdAt) });
                }
                return children;
            };

            const roots = await File.find({ type: "folder", parentId: null }).lean();
            const rootFiles = await File.find({ type: "file", parentId: null }).lean();
            const result = [];

            for (let root of roots) {
                const children = await fetchChildren(root);
                result.push({ ...root, children, formatDate: importDate(root.createdAt) });
            }

            for (let f of rootFiles) {
                result.push({ ...f, formatDate: importDate(f.createdAt) });
            }

            return res.status(200).json({
                message: "Cập nhật tên thành công",
                file,
                list: result
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Server bị chập điện, liên hệ Hùng để fix" });
        }
    }


    async deleteFiles(req, res) {
        try {
            const { fileIds } = req.body;
            if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
                return res.status(400).json({ error: "Thiếu fileIds để xóa" });
            }

            const rootUploadPath = path.join(process.cwd(), "src", "upload");

            const resolveAbsolutePath = (dbPath = "") => {
                const decodedPath = decodeURIComponent(dbPath);
                const relativePath = decodedPath.replace(/^upload[\\/]/, "");
                return path.join(rootUploadPath, relativePath);
            };

            const deleteNode = async (file) => {
                if (!file) return;

                if (file.type === "folder") {
                    const children = await File.find({ parentId: file._id });
                    for (let child of children) {
                        await deleteNode(child);
                    }
                    const folderPath = resolveAbsolutePath(file.path);
                    if (fs.existsSync(folderPath)) {
                        fs.rmSync(folderPath, { recursive: true, force: true });
                    }
                } else if (file.type === "file") {
                    const filePath = resolveAbsolutePath(file.path);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }

                await File.deleteOne({ _id: file._id });
            };

            for (let fileId of fileIds) {
                const file = await File.findById(fileId);
                await deleteNode(file);
            }

            // Lấy lại toàn bộ cây file/folder để trả về FE
            const fetchChildren = async (parent) => {
                const childrenFolders = await File.find({ type: "folder", parentId: parent._id }).lean();
                const childrenFiles = await File.find({ type: "file", parentId: parent._id }).lean();
                const children = [];

                for (let folder of childrenFolders) {
                    const sub = await fetchChildren(folder);
                    children.push({ ...folder, children: sub, formatDate: importDate(folder.createdAt) });
                }
                for (let f of childrenFiles) {
                    children.push({ ...f, formatDate: importDate(f.createdAt) });
                }
                return children;
            };

            const roots = await File.find({ type: "folder", parentId: null }).lean();
            const rootFiles = await File.find({ type: "file", parentId: null }).lean();
            const result = [];

            for (let root of roots) {
                const children = await fetchChildren(root);
                result.push({ ...root, children, formatDate: importDate(root.createdAt) });
            }
            for (let f of rootFiles) {
                result.push({ ...f, formatDate: importDate(f.createdAt) });
            }

            return res.status(200).json({
                message: "Xóa thành công",
                list: result
            });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Server bị chập điện, liên hệ Hùng để fix" });
        }
    }




    
}

module.exports = new FileController();
