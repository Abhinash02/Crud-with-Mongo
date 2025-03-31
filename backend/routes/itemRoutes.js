const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

// ✅ Get all items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Create a new item
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name.trim()) return res.status(400).json({ error: "Name is required" });

    const newItem = new Item({ name, description });
    await newItem.save();

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to create item" });
  }
});

// ✅ Update an item
router.put("/:id", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name.trim()) return res.status(400).json({ error: "Name is required" });

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, { name, description }, { new: true });

    if (!updatedItem) return res.status(404).json({ error: "Item not found" });

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to update item" });
  }
});

// ✅ Delete an item
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ error: "Item not found" });

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
