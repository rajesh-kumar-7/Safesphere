
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Report = require("./models/report");

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "SafeSphere API is running!" });
});

// Get saved reports
app.get("/api/reports", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

    res.json(
      reports.map((report) => ({
        id: report._id,
        category: report.category,
        severity: report.severity,
        latitude: report.location.latitude,
        longitude: report.location.longitude,
        imageUrl: report.imageUrl,
        verificationStatus: report.verificationStatus,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reports" });
  }
});

// Create a report
app.post("/api/reports", async (req, res) => {
  try {
    const { category, severity, description, latitude, longitude, imageUrl } =
      req.body;

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
      return res.status(400).json({ message: "Invalid report data" });
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
    res.status(500).json({ message: "Failed to save report" });
  }
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`SafeSphere API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });