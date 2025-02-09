const upload = require("../middleware/uploadMiddleware");
require("dotenv").config({ path: "./config.env" });

const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;

const URI = process.env.ATLAS_URI;
const PORT = process.env.PORT;
const baseUrl = `http://localhost:${PORT}/files/`;

const mongoClient = new MongoClient(URI);

const uploadFiles = async (req, res) => {
  try {
    await upload(req, res);

    console.log("Received files:", req.files); // Debugging log

    if (!req.files || req.files.length === 0) {
      console.error("Upload error: No files received.");
      return res
        .status(400)
        .json({ message: "You must select at least 1 file." });
    }

    return res.status(200).json({
      message: "Files have been uploaded.",
      files: req.files,
    });
  } catch (error) {
    console.log("Upload error:", error);

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).send({
        message: "Too many files to upload.",
      });
    }
    return res.status(500).send({
      message: `Error when trying to upload files: ${error}`,
    });
  }
};

const getListFiles = async (req, res) => {
  try {
    await mongoClient.connect();

    const database = mongoClient.db(process.env.DATABASE);
    const images = database.collection(`${process.env.IMG_BUCKET}.files`);

    const cursor = images.find({});

    if ((await cursor.count()) === 0) {
      return res.status(500).send({
        message: "No files found!",
      });
    }

    let fileInfos = [];
    await cursor.forEach((doc) => {
      fileInfos.push({
        name: doc.filename,
        url: baseUrl + doc.filename,
      });
    });

    return res.status(200).send(fileInfos);
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

const download = async (req, res) => {
  try {
    await mongoClient.connect();

    const database = mongoClient.db(process.env.DATABASE);
    const bucket = new GridFSBucket(database, {
      bucketName: process.env.IMG_BUCKET,
    });

    let downloadStream = bucket.openDownloadStreamByName(req.params.name);

    downloadStream.on("data", function (data) {
      return res.status(200).write(data);
    });

    downloadStream.on("error", function (err) {
      return res.status(404).send({ message: "Cannot download the Image!" });
    });

    downloadStream.on("end", () => {
      return res.end();
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message,
    });
  }
};

module.exports = {
  uploadFiles,
  getListFiles,
  download,
};
