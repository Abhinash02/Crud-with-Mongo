const jwt = require("jsonwebtoken");

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token; // ✅ Ensure JWT is from cookies
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    console.log("🔹 Authenticated User:", req.user.id);
    next();
  });
};

module.exports = { authenticateJWT }; // ✅ CommonJS export
