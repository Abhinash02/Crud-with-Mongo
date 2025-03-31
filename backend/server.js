require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const connectDB = require("./db");
const itemRoutes = require("./routes/itemRoutes");
// ✅ Connect to MongoDB Atlas
connectDB();

const app = express();  // Define app here first

const port = 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ✅ Hardcoded Users with Roles
const users = [
  { id: 1, username: "user", password: "123", role: "user" },
  { id: 2, username: "admin", password: "admin123", role: "admin" }
];

// ✅ Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized - No token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden - Invalid token" });
    req.user = user;
    next();
  });
};

// ✅ Role-Based Access Control Middleware
const authorizeRole = (role) => (req, res, next) => {
  if (req.user.role !== role) return res.status(403).json({ error: "Access denied" });
  next();
};

// ✅ Login Route (Sets JWT Cookie)
app.post("/login", (req, res) => {
  const { username, password, role } = req.body;

  if (!role) return res.status(400).json({ error: "Role is required" });

  const user = users.find((u) => u.username === username && u.password === password && u.role === role);
  if (!user) return res.status(401).json({ error: "Invalid credentials or role mismatch" });

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

  res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "strict" });
  res.json({ message: "Login successful", role: user.role });
});

// ✅ Logout Route
app.post("/logout", (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.json({ message: "Logged out successfully" });
});

// ✅ Protected Routes
app.get("/admin", authenticateJWT, authorizeRole("admin"), (req, res) => {
  res.json({ message: "Welcome Admin", user: req.user });
});

app.get("/user", authenticateJWT, authorizeRole("user"), (req, res) => {
  res.json({ message: "Welcome User", user: req.user });
});

app.get("/protected", authenticateJWT, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// ✅ API Routes
app.use("/api/items", itemRoutes);

// ✅ Start Server
app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
