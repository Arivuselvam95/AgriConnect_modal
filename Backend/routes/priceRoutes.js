// =====================================
// Price Prediction Routes
// =====================================

const express = require("express");
const router = express.Router();

const { predictPrice } = require("../controllers/priceController");

const { getMarketPrices } = require("../controllers/priceController");

// POST /api/price/predict
router.post("/predict", predictPrice);

// GET /api/price/market
router.get("/market", getMarketPrices);

module.exports = router;
