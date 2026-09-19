const crypto = require("crypto");

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

const getAuthSecret = () => {
  if (!process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET is not configured.");
  }
  return process.env.AUTH_SECRET;
};

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
  return `scrypt:${salt}:${key.toString("hex")}`;
};

const verifyPassword = async (password, storedHash) => {
  if (!storedHash || !storedHash.startsWith("scrypt:")) return false;
  const [, salt, hash] = storedHash.split(":");
  const key = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
  const expected = Buffer.from(hash, "hex");
  return expected.length === key.length && crypto.timingSafeEqual(expected, key);
};

const createToken = (user) => {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", getAuthSecret()).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
};

const verifyToken = (token) => {
  const [encoded, signature] = String(token || "").split(".");
  if (!encoded || !signature) throw new Error("Invalid authentication token.");

  const expected = crypto.createHmac("sha256", getAuthSecret()).update(encoded).digest("base64url");
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    throw new Error("Invalid authentication token.");
  }

  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Authentication token expired.");
  }
  return payload;
};

module.exports = { hashPassword, verifyPassword, createToken, verifyToken };
