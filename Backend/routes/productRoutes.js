// =====================================
// Product Routes - FarmHub
// =====================================

const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  createProduct,
  getAllProducts,
  getMyProducts
  , updateProduct
} = require("../controllers/productController");

// Create product (Farmer only)
router.post("/", authMiddleware, createProduct);

// Get all products (Public)
router.get("/", getAllProducts);

// Get logged-in farmer products
router.get("/my", authMiddleware, getMyProducts);

// Update product (Farmer only)
router.put("/:id", authMiddleware, updateProduct);

module.exports = router;
