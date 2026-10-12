
const Report = require("../models/report");

// GET /api/reports
const getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

    res.json(
      reports.map((report) => ({
        id: report._id,
        category: report.category,
        severity: report.severity,
        description: report.description,
        latitude: report.location.latitude,
        longitude: report.location.longitude,
        imageUrl: report.imageUrl,
        verificationStatus: report.verificationStatus,
        createdAt: report.createdAt,
      }))
    );
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reports",
    });
  }
};

// POST /api/reports
const createReport = async (req, res) => {
  try {
    const {
      category,
      severity,
      description,
      latitude,
      longitude,
      imageUrl,
    } = req.body;

    if (
      !category ||
      !["low", "medium", "high"].includes(severity) ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        message: "Invalid report data",
      });
    }

    const report = await Report.create({
      category,
      severity,
      description,
      location: { latitude, longitude },
      imageUrl,
    });

    res.status(201).json({
      message: "Report saved successfully",
      id: report._id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save report",
    });
  }
};

module.exports = {
  getReports,
  createReport,
};