// ===============================
// AgriConnect Backend - Server
// ===============================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// Routes Import
// ===============================
const authRoutes = require("./routes/authRoutes");
const priceRoutes = require("./routes/priceRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cropDataRoutes = require("./routes/cropDataRoutes");



// ===============================
// Route Usage
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/price", priceRoutes);
app.use("/api/recommendation", recommendationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cropsdata", cropDataRoutes);


// ===============================
// Default Route
// ===============================
app.get("/", (req, res) => {
  res.send("AgriConnect Backend Running 🚀");
});

// ===============================
// MongoDB Connection
// ===============================
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    // console.log(process.env.MONGO_URI);
    console.error("❌ MongoDB Connection Error:", err.message);
  });
