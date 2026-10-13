
const express = require("express");
const router = express.Router();

const {
  getReports,
  createReport,
  updateReportStatus,
  deleteReport,
} = require("../controller/reportController");

// Public routes
router.get("/", getReports);
router.post("/", createReport);

// Admin routes for local testing
router.get("/admin", getReports);
router.patch("/:id/status", updateReportStatus);
router.delete("/:id", deleteReport);

module.exports = router;

