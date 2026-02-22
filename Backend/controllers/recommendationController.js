// =====================================
// Crop Recommendation Controller
// With Weather API Integration
// =====================================

const axios = require("axios");
const Recommendation = require("../models/Recommendation");

exports.recommendCrop = async (req, res) => {
  try {
    const {
      Nitrogen,
      Phosphorus,
      Potassium,
      pH_Value,
      district
    } = req.body;

    // Basic validation
    if (
      Nitrogen === undefined ||
      Phosphorus === undefined ||
      Potassium === undefined ||
      pH_Value === undefined ||
      !district
    ) {
      return res.status(400).json({
        message: "N, P, K, pH and district are required."
      });
    }

    // =====================================
    // 1️⃣ Get Weather Data from OpenWeather
    // =====================================

    let temperature = 30;
    let humidity = 70;
    let rainfall = 0;

    try {
    const weatherResponse = await axios.get(
        "https://api.openweathermap.org/data/2.5/weather",
        {
        params: {
            q: district,
            appid: process.env.WEATHER_API_KEY,
            units: "metric"
        }
        }
    );
    // console.log("Weather API Response:", weatherResponse.data);
    temperature = weatherResponse.data.main.temp;
    humidity = weatherResponse.data.main.humidity;

    rainfall =
        weatherResponse.data.rain?.["1h"] ||
        weatherResponse.data.rain?.["3h"] ||
        0;

    } catch (error) {
    
      return res.status(404).json({
        message: "District not found or Weather API failed."
      });
    }
    

    // =====================================
    // 2️⃣ Send Data to ML Model
    // =====================================

    const mlResponse = await axios.post(
      `${process.env.ML_API_URL}/predict/crop`,
      {
        Nitrogen,
        Phosphorus,
        Potassium,
        Temperature: temperature,
        Humidity: humidity,
        pH_Value,
        Rainfall: rainfall
      }
    );

    // =====================================
    // 3️⃣ Return Combined Response
    // =====================================

    // Save history
    await Recommendation.create({
        user: req.user?.id || null, // if using auth
        Nitrogen,
        Phosphorus,
        Potassium,
        pH_Value,
        district,
        temperature,
        humidity,
        rainfall,
        result: mlResponse.data
    });

    res.json({
        weather: {
            district,
            temperature,
            humidity,
            rainfall
        },
        recommendation: mlResponse.data
    });


  } catch (error) {
    console.error("Recommendation Error:", error.message);

    res.status(500).json({
      message: "Crop recommendation failed."
    });
  }
};

// ===============================
// Get Weather for a city/district
// Query param: city or district
// ===============================
exports.getWeather = async (req, res) => {
  try {
    const city = req.query.city || req.query.district || req.query.q;
    if (!city) {
      return res.status(400).json({ message: 'City/district is required' });
    }

    const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: city,
        appid: process.env.WEATHER_API_KEY,
        units: 'metric',
      },
    });

    const data = weatherResponse.data;

    const weather = {
      city: data.name,
      country: data.sys?.country,
      temperature: data.main?.temp,
      feels_like: data.main?.feels_like,
      humidity: data.main?.humidity,
      pressure: data.main?.pressure,
      wind: {
        speed: data.wind?.speed,
        deg: data.wind?.deg,
      },
      precipitation:
        data.rain?.['1h'] || data.rain?.['3h'] || data.snow?.['1h'] || data.snow?.['3h'] || 0,
      sunrise: data.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toISOString() : null,
      sunset: data.sys?.sunset ? new Date(data.sys.sunset * 1000).toISOString() : null,
      description: data.weather?.[0]?.description,
    };

    res.json({ weather });
  } catch (error) {
    console.error('Weather fetch error:', error.message);
    res.status(500).json({ message: 'Failed to fetch weather' });
  }
};
