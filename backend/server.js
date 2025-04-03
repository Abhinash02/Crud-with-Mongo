require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const connectDB = require("./db");
const itemRoutes = require("./routes/itemRoutes");
const User = require("./models/user");

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// ✅ Connect to MongoDB Atlas
connectDB();

// ✅ Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

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

// ✅ Signup Route
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "All fields are required" });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
});

// ✅ Login Route (Sets JWT Cookie)
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role || "user" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ message: "Login successful", role: user.role });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

// ✅ Logout Route
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// ✅ Protected Routes
app.get("/admin", authenticateJWT, authorizeRole("admin"), (req, res) => {
  res.json({ message: "Welcome Admin", user: req.user });
});

app.get("/user", authenticateJWT, (req, res) => {
  res.json({ message: "Welcome User", user: req.user });
});

app.get("/protected", authenticateJWT, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// ✅ API Routes (CRUD Operations) - No need to add `authenticateJWT` again here, it's handled in `itemRoutes.js`
app.use("/api/items", itemRoutes);

// ✅ Start Server
app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
