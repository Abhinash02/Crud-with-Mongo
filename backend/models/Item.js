const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ Store user's ID
});

module.exports = mongoose.model("Item", itemSchema);
