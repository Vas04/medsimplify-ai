const pool = require("../db/database");
const {
  hashPassword,
  verifyPassword,
  createToken,
} = require("../services/authService");

const cleanUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.created_at,
});

const register = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (name.length < 2) {
      return res.status(400).json({ success: false, message: "Name must contain at least 2 characters." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must contain at least 8 characters." });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    const user = cleanUser(result.rows[0]);
    return res.status(201).json({ success: true, user, token: createToken(user) });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Unable to create account." });
  }
};

const login = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const result = await pool.query(
      "SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1",
      [email]
    );

    if (!result.rows.length || !(await verifyPassword(password, result.rows[0].password_hash))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const user = cleanUser(result.rows[0]);
    return res.json({ success: true, user, token: createToken(user) });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Unable to log in." });
  }
};

const me = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [req.user.sub]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.json({ success: true, user: cleanUser(result.rows[0]) });
  } catch (error) {
    console.error("Auth me error:", error);
    return res.status(500).json({ success: false, message: "Unable to load account." });
  }
};

module.exports = { register, login, me };
