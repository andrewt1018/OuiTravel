const { GridFsStorage } = require("multer-gridfs-storage");
const util = require("util");
const multer = require("multer");
require("dotenv").config({ path: "./config.env" });

const storage = new GridFsStorage({
  url: `${process.env.ATLAS_URI}/${process.env.DATABASE}`,
  file: async (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (!match.includes(file.mimetype)) {
      console.error("Unsupported file type:", file.mimetype);
      throw new Error("Unsupported file type.");
    }

    return new Promise((resolve, reject) => {
      resolve({
        bucketName: process.env.IMG_BUCKET,
        filename: `${Date.now()}-OuiTravel-${file.originalname}`,
      });
    });
  },
});

storage.on("connection", () => {
  console.log("Connected to MongoDB for file storage");
});

storage.on("connectionFailed", (err) => {
  console.error("Failed to connect to MongoDB for file storage", err);
});

const uploadFiles = multer({ storage: storage }).array("file", 10);
const uploadFilesMiddleware = util.promisify(uploadFiles);

module.exports = uploadFilesMiddleware;
