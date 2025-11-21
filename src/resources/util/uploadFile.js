const multer = require("multer");
const fs = require("fs");
const path = require("path");
const File = require("../app/model/file.model");

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            let { parentId } = req.body;

            let folderPath = path.join(__dirname, "..", "..", "upload"); // mặc định

            if (parentId && parentId !== "null") {
                const parent = await File.findById(parentId);

                if (parent) {
                    folderPath = path.join(__dirname, "..", "..", parent.path);
                }
            }

            // Tạo thư mục nếu chưa có
            fs.mkdirSync(folderPath, { recursive: true });

            cb(null, folderPath);

        } catch (err) {
            console.log("Multer error:", err);
            cb(err, null);
        }
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

module.exports = multer({ storage });
