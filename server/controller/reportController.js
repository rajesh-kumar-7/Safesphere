
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


async function updateReportStatus(req, res) {
  try {
    const { status } = req.body;

    if (!["pending", "verified", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid report status",
      });
    }

 const report = await Report.findByIdAndUpdate(
  req.params.id,
  { verificationStatus: status },
  { returnDocument: "after", runValidators: true }
);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Report status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update report status" });
  }
}

async function deleteReport(req, res) {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete report" });
  }
}



module.exports = {
  getReports,
  createReport,
  updateReportStatus,
  deleteReport,
};

