const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/uploadController");

router.post("/upload", uploadController.uploadFiles);
router.get("/", uploadController.getListFiles);
router.get("/:name", uploadController.download);

module.exports = router;
