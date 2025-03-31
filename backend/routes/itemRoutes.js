const express = require("express");
const router = express.Router();
const Item = require("../models/Item");
const itemController = require('../controllers/itemController');
// ✅ Fetch All Items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Add New Item
router.post("/", async (req, res) => {
  try {
    const newItem = new Item({ name: req.body.name });
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(400).json({ error: "Failed to add item" });
  }
});

// ✅ Delete Item
router.delete("/:id", async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});


// PUT route to update an item
router.put('/:id', itemController.updateItem);
module.exports = router;
