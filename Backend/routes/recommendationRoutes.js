const express = require("express");
const router = express.Router();

const {
  recommendCrop
} = require("../controllers/recommendationController");

// POST route
router.post("/recommend", recommendCrop);

// GET weather for a city/district
const { getWeather } = require("../controllers/recommendationController");
router.get("/weather", getWeather);

module.exports = router;
