
const express = require("express");

const router = express.Router();

const {
  uploadImage,
} = require("../controller/uploadController");

router.post("/", uploadImage);

module.exports = router;