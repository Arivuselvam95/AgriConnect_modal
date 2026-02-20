import { useState } from 'react';
import { priceService } from '../../services/price.service';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Search, TrendingUp } from 'lucide-react';
import './PricePrediction.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PricePrediction = () => {
  const [cropName, setCropName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [predictionData, setPredictionData] = useState(null);

  const defaultCrops = [
    { name: 'Wheat', icon: '🌾' },
    { name: 'Paddy', icon: '🌾' },
    { name: 'Maize', icon: '🌽' },
    { name: 'Cotton', icon: '🌸' },
    { name: 'Sugarcane', icon: '🎋' },
  ];

  const handleCropSelect = async (crop) => {
    setCropName(crop);
    await predictPrice(crop);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!cropName.trim()) {
      setError('Please enter a crop name');
      return;
    }
    await predictPrice(cropName);
  };

  const predictPrice = async (crop) => {
    setLoading(true);
    setError('');
    setPredictionData(null);

    try {
      const data = await priceService.predictPrice(crop);
      setPredictionData(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to predict price. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!predictionData) return null;

    const labels = [
      ...Array(12)
        .fill()
        .map((_, i) => `Month ${i + 1}`),
      'Predicted',
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Actual Price',
          data: [...predictionData.graph_data.actual_prices_last_12_months, null],
          borderColor: '#2e7d32',
          backgroundColor: 'rgba(46, 125, 50, 0.1)',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Predicted Price',
          data: [
            ...Array(12).fill(null),
            predictionData.graph_data.predicted_next_month,
          ],
          borderColor: '#f57c00',
          backgroundColor: 'rgba(245, 124, 0, 0.1)',
          pointRadius: 8,
          pointHoverRadius: 10,
          pointStyle: 'star',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            family: 'Inter, sans-serif',
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => `₹${value}`,
        },
      },
    },
  };

  return (
    <div className="price-prediction-page">
      <div className="price-container">
        <div className="price-header">
          <h1>Crop Price Prediction</h1>
          <p>AI-powered price forecasting for better decision making</p>
        </div>

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search for a crop (e.g., Wheat, Rice, Cotton)"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
              />
            </div>
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? 'Predicting...' : 'Predict Price'}
            </button>
          </form>
        </div>

        <div className="default-crops">
          <h3>Quick Select</h3>
          <div className="crop-cards">
            {defaultCrops.map((crop, index) => (
              <div
                key={index}
                className="crop-card"
                onClick={() => handleCropSelect(crop.name)}
              >
                <span className="crop-icon">{crop.icon}</span>
                <span className="crop-name">{crop.name}</span>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {predictionData && (
          <div className="prediction-results">
            <div className="prediction-header-card">
              <div className="prediction-info">
                <h2>{predictionData.crop}</h2>
                <p className="unit">{predictionData.unit}</p>
              </div>
              <div className="predicted-price">
                <TrendingUp size={32} color="#2e7d32" />
                <div>
                  <p className="label">Next Month Prediction</p>
                  <h1>₹{predictionData.predicted_price}</h1>
                </div>
              </div>
            </div>

            <div className="chart-section">
              <h3>12-Month Price Trend</h3>
              <div className="chart-container">
                <Line data={getChartData()} options={chartOptions} />
              </div>
            </div>

            <div className="price-table">
              <h3>Monthly Price History</h3>
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Price (₹/quintal)</th>
                  </tr>
                </thead>
                <tbody>
                  {predictionData.graph_data.actual_prices_last_12_months.map(
                    (price, index) => (
                      <tr key={index}>
                        <td>Month {index + 1}</td>
                        <td>₹{price.toFixed(2)}</td>
                      </tr>
                    )
                  )}
                  <tr className="predicted-row">
                    <td>Predicted (Next Month)</td>
                    <td className="predicted-value">
                      ₹{predictionData.predicted_price}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricePrediction;
