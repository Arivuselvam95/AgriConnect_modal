// =====================================
// Price Prediction Routes
// =====================================

const express = require("express");
const router = express.Router();

const { predictPrice } = require("../controllers/priceController");

const { getMarketPrices, getLastWeekMarketPrices } = require("../controllers/priceController");

// POST /api/price/predict
router.post("/predict", predictPrice);

// GET /api/price/market
router.get("/market", getMarketPrices);

// GET /api/price/last-week
router.get("/last-week", getLastWeekMarketPrices);

module.exports = router;
