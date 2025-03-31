// /controllers/itemController.js
const Item = require('../models/Item');

// Controller to update an item by its ID
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedItem = await Item.findByIdAndUpdate(id, { name }, { new: true });

    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to update item" });
  }
};
