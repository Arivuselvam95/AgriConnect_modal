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
    let { State, District, Commodity, Arrival_Date } = req.query;

    // Capitalize commodity name (first letter uppercase)
    if (Commodity) {
      Commodity = Commodity.charAt(0).toUpperCase() + Commodity.slice(1).toLowerCase();
    }

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

// ===============================
// Fetch Last Week Market Prices
// Query params: State, District, Commodity
// ===============================
exports.getLastWeekMarketPrices = async (req, res) => {
  try {
    let { State, District, Commodity } = req.query;
    
    // Capitalize commodity name (first letter uppercase)
    if (Commodity) {
      Commodity = Commodity.charAt(0).toUpperCase() + Commodity.slice(1).toLowerCase();
    }
    
    const allRecords = [];
    const today = new Date();

    console.log(`Fetching last week prices for: State=${State}, District=${District}, Commodity=${Commodity}`);

    // Fetch data for the last 7 days (wider range to increase chance of finding data)
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();
      const formatted = `${dd}/${mm}/${yyyy}`;

      const params = {
        'api-key': process.env.AGMARKET_API_KEY,
        format: 'json',
        limit: 100,
      };

      if (State) params['filters[State]'] = State;
      if (District) params['filters[District]'] = District;
      if (Commodity) params['filters[Commodity]'] = Commodity;
      params['filters[Arrival_Date]'] = formatted;

      try {
        const response = await axios.get(process.env.AGMARKNET_BASE_URL, { 
          params,
          timeout: 5000  // 5 second timeout
        });

        // Handle different response formats from Agmarknet
        let records = [];
        if (response.data && response.data.records) {
          records = response.data.records;
        } else if (Array.isArray(response.data)) {
          records = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // If response is already an object with data, use it
          records = response.data;
        }

        if (Array.isArray(records) && records.length > 0) {
          console.log(`Found ${records.length} records for ${formatted}`);
          allRecords.push(...records);
        }
      } catch (error) {
        // Log but continue with next date
        console.debug(`No data for ${formatted}:`, error.message);
      }
    }

    // If no records found, fetch latest available data without date filter
    if (allRecords.length === 0) {
      console.log('No records found for the last 7 days');
    }

    console.log(`Total records found: ${allRecords.length}`);
    res.json({ records: allRecords });
  } catch (error) {
    console.error('Get last week prices error:', error.message || error);
    res.status(500).json({ message: 'Failed to fetch last week prices' });
  }
};
