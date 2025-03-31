const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const Item = require("./models/Item"); // Ensure correct path

Item.find()
  .then((items) => {
    console.log("Items from DB:", items);
    mongoose.connection.close(); // Close connection after fetching data
  })
  .catch(console.error);
