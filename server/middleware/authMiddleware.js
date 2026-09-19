const { verifyToken } = require("../services/authService");

const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Your session is invalid or expired. Please log in again.",
    });
  }
};

module.exports = { requireAuth };
