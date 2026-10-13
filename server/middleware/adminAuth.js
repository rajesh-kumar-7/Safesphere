const ADMIN_PASSWORD = "123";

module.exports = function adminAuth(req, res, next) {
  const password = req.get("x-admin-password");

  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      message: "Invalid admin password",
    });
  }

  next();
};