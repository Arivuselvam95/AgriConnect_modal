// =====================================
// Price Prediction Controller
// =====================================

const axios = require("axios");

// Predict Crop Price
exports.predictPrice = async (req, res) => {
  try {
    const { crop } = req.body;

    if (!crop) {
      return res.status(400).json({ message: "Crop name is required." });
    }

    // Call Python ML API
    const response = await axios.get(
      `${process.env.ML_API_URL}/predict/${crop}`
      
    );

    res.json(response.data);

  } catch (error) {
    console.error("Price Prediction Error:", error.message);
    res.status(500).json({ message: "Price prediction service failed." });
  }
};

// ===============================
// Fetch Market Prices from Agmarknet (proxy)
// Query params: State, District, Commodity, Arrival_Date (DD/MM/YYYY)
// ===============================
exports.getMarketPrices = async (req, res) => {
  try {
    const { State, District, Commodity, Arrival_Date } = req.query;

    const params = {
      'api-key': process.env.AGMARKET_API_KEY,
      format: 'json',
      limit: 100,
    };

    if (State) params['filters[State]'] = State;
    if (District) params['filters[District]'] = District;
    if (Commodity) params['filters[Commodity]'] = Commodity;
    if (Arrival_Date) params['filters[Arrival_Date]'] = Arrival_Date;

    const response = await axios.get(process.env.AGMARKNET_BASE_URL, { params });

    res.json(response.data);
  } catch (error) {
    console.error('Agmarknet proxy error:', error.message || error);
    res.status(500).json({ message: 'Failed to fetch market prices' });
  }
};
