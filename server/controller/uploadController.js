
const cloudinary = require("../config/cloudinary");

// POST /api/upload
const uploadImage = async (req, res) => {
  try {
    const { photo } = req.body;

    if (
      typeof photo !== "string" ||
      !photo.startsWith("data:image/") ||
      photo.length > 8_000_000
    ) {
      return res.status(400).json({
        message: "A valid image under the size limit is required.",
      });
    }

    const result = await cloudinary.uploader.upload(photo, {
      folder: "safesphere/reports",
      resource_type: "image",
    });

    res.json({
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Image upload failed:", error.message);

    res.status(500).json({
      message: "Image upload failed.",
    });
  }
};

module.exports = { uploadImage };