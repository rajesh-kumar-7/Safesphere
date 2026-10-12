
const express = require("express");

const router = express.Router();

const {
  getReports,
  createReport,
} = require("../controller/reportController");

router.get("/", getReports);
router.post("/", createReport);

module.exports = router;