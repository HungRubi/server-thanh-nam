const express = require("express");
const router = express.Router();
const fileController = require("../app/controller/file.controller");
const upload = require("../util/uploadFile");

router.post("/folder", fileController.createFolder);
router.post("/upload", upload.single("file"), fileController.uploadFile);
router.delete("/delete", fileController.deleteFiles);
router.put("/update-name", fileController.updateFileName);
router.get("/", fileController.getAllFoldersAndFiles);

module.exports = router;
