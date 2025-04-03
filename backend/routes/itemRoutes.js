const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const { authenticateJWT } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

// ✅ Get all items for the logged-in user
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const items = await Item.find({ userId: req.user.id });
    res.json(items);
  } catch (error) {
    console.error("❌ Error fetching items:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// ✅ Create a new item for the logged-in user
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const newItem = new Item({
      name: name.trim(),
      description: description?.trim() || "", // Handle optional description
      userId: req.user.id,
    });

    await newItem.save();
    res.status(201).json({ message: "Item created successfully", item: newItem });
  } catch (error) {
    console.error("❌ Error creating item:", error);
    res.status(500).json({ error: "Failed to create item", details: error.message });
  }
});

// ✅ Update an item (Only for the logged-in user)
router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const updatedItem = await Item.findOneAndUpdate(
      { _id: id, userId: req.user.id }, // Ensure user can only update their own items
      { name: name.trim(), description: description?.trim() || "" },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found or unauthorized" });
    }

    res.json({ message: "Item updated successfully", item: updatedItem });
  } catch (error) {
    console.error("❌ Error updating item:", error);
    res.status(500).json({ error: "Failed to update item", details: error.message });
  }
});

// ✅ Delete an item (Only for the logged-in user)
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    // ✅ Directly find and delete in one query
    const deletedItem = await Item.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found or unauthorized" });
    }

    res.json({ message: "Item deleted successfully", deletedItem });
  } catch (error) {
    console.error("❌ Error deleting item:", error);
    res.status(500).json({ error: "Delete failed", details: error.message });
  }
});

module.exports = router;
