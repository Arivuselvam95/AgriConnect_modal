import { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('trend'); // 'trend' or 'yesterday'
  const [rangeMonths, setRangeMonths] = useState(12); // 3,6,12
  const [activePanel, setActivePanel] = useState('prediction'); // 'prediction' or 'market'
  const [marketFilters, setMarketFilters] = useState({
    State: 'Tamil Nadu',
    District: 'Erode',
    Commodity: '',
    Arrival_Date: '',
  });
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketData, setMarketData] = useState(null);

  // yesterday prices states
  const [yesterdayLoading, setYesterdayLoading] = useState(false);
  const [yesterdayData, setYesterdayData] = useState(null);

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

  const handleMarketSearch = async (e) => {
    e && e.preventDefault();
    setMarketLoading(true);
    setError('');
    setMarketData(null);
    try {
      const params = {};
      if (marketFilters.State) params.State = marketFilters.State;
      if (marketFilters.District) params.District = marketFilters.District;
      if (marketFilters.Commodity) params.Commodity = marketFilters.Commodity;
      if (marketFilters.Arrival_Date) params.Arrival_Date = marketFilters.Arrival_Date;

      const data = await priceService.getMarketPrices(params);
      setMarketData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch market prices');
    } finally {
      setMarketLoading(false);
    }
  };

  const predictPrice = async (crop) => {
    setLoading(true);
    setError('');
    setPredictionData(null);
    setYesterdayData(null);

    try {
      const data = await priceService.predictPrice(crop);
      setPredictionData(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to predict price. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchYesterdayPrices = async (crop) => {
    if (!crop) return;
    setYesterdayLoading(true);
    setError('');
    setYesterdayData(null);
    try {
      const data = await priceService.getYesterdayPrices(crop);
      setYesterdayData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch yesterday prices');
    } finally {
      setYesterdayLoading(false);
    }
  };

  const getChartData = () => {
    if (!predictionData) return null;

    const allLabels = Array(12)
      .fill()
      .map((_, i) => `Month ${i + 1}`);
    const labels = [...allLabels.slice(12 - rangeMonths), 'Predicted'];
    const actualPrices = predictionData.graph_data.actual_prices_last_12_months.slice(
      12 - rangeMonths
    );

    return {
      labels,
      datasets: [
        {
          label: 'Actual Price',
          data: [...actualPrices, null],
          borderColor: '#155e63',
          backgroundColor: 'rgba(21, 94, 99, 0.08)',
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

  // effect: fetch yesterday prices when tab switches and crop available
  useEffect(() => {
    if (activeTab === 'yesterday' && predictionData) {
      fetchYesterdayPrices(predictionData.crop);
    }
  }, [activeTab, predictionData]);

  return (
    <div className="price-prediction-page">
      <div className="price-container">
        <div className="price-header">
          <h1>Crop Price Prediction</h1>
          <p>AI-powered price forecasting for better decision making</p>
        </div>

        {/* search moved into Prediction panel so it only shows when activePanel === 'prediction' */}

        <div className="page-tabs" style={{marginBottom: 20}}>
          <button className={`tab ${activePanel === 'prediction' ? 'active' : ''}`} onClick={() => setActivePanel('prediction')}>Price Prediction</button>
          <button className={`tab ${activePanel === 'market' ? 'active' : ''}`} onClick={() => setActivePanel('market')}>Market Prices</button>
        </div>

        {activePanel === 'prediction' && (
          <>
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
          </>
        )}

        {/* Panels: show prediction or market based on activePanel */}
        {activePanel === 'prediction' && (
          predictionData && (
            <div className="prediction-results">
              <div className="prediction-header-card">
                <div className="prediction-info">
                  <h2>{predictionData.crop}</h2>
                  <p className="unit">{predictionData.unit}</p>
                </div>
                <div className="predicted-price">
                  <TrendingUp size={32} color="#155e63" />
                  <div>
                    <p className="label">Next Month Prediction</p>
                    <h1>₹{predictionData.predicted_price}</h1>
                  </div>
                </div>
              </div>

              <div className="chart-section">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                  <h3>{rangeMonths}-Month Price Trend</h3>
                  <div style={{display: 'flex', gap: 8}}>
                    <button className={`filter-btn ${rangeMonths===3? 'active':''}`} onClick={() => setRangeMonths(3)}>3M</button>
                    <button className={`filter-btn ${rangeMonths===6? 'active':''}`} onClick={() => setRangeMonths(6)}>6M</button>
                    <button className={`filter-btn ${rangeMonths===12? 'active':''}`} onClick={() => setRangeMonths(12)}>1Y</button>
                  </div>
                </div>

                <div style={{display:'flex', gap:12, marginBottom:12}}>
                  <button className={`tab ${activeTab==='trend'?'active':''}`} onClick={() => setActiveTab('trend')}>Trend</button>
                  <button className={`tab ${activeTab==='yesterday'?'active':''}`} onClick={() => setActiveTab('yesterday')}>Yesterday Prices</button>
                </div>

                <div className="chart-container">
                  {activeTab === 'trend' ? (
                    <Line data={getChartData()} options={chartOptions} />
                  ) : (
                    <div className="yesterday-table">
                      {yesterdayLoading && <p>Loading yesterday prices...</p>}
                      {yesterdayData && yesterdayData.records && yesterdayData.records.length === 0 && (
                        <p>No records found for yesterday.</p>
                      )}
                      {yesterdayData && yesterdayData.records && yesterdayData.records.length > 0 && (
                        <table>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Market</th>
                              <th>Commodity</th>
                              <th>Min Price</th>
                              <th>Max Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {yesterdayData.records.map((rec, idx) => (
                              <tr key={idx}>
                                <td>{rec.Arrival_Date}</td>
                                <td>{rec.Market}</td>
                                <td>{rec.Commodity}</td>
                                <td>₹{rec.Min_Price || '-'}</td>
                                <td>₹{rec.Max_Price || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
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
          )
        )}

        {activePanel === 'market' && (
          <div className="prediction-results">
            <div className="chart-section">
              <h3>Market Prices</h3>
              <div className="market-section">
                <form className="market-form" onSubmit={handleMarketSearch}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>State</label>
                      <input type="text" value={marketFilters.State} onChange={(e) => setMarketFilters({...marketFilters, State: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>District</label>
                      <input type="text" value={marketFilters.District} onChange={(e) => setMarketFilters({...marketFilters, District: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Commodity</label>
                      <input type="text" value={marketFilters.Commodity} onChange={(e) => setMarketFilters({...marketFilters, Commodity: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Arrival Date</label>
                      <input type="date" value={marketFilters._date || ''} onChange={(e) => {
                        const v = e.target.value;
                        const formatted = v ? v.split('-').reverse().join('/') : '';
                        setMarketFilters({...marketFilters, Arrival_Date: formatted, _date: v});
                      }} />
                    </div>
                  </div>
                  <div style={{display:'flex', gap:10, marginTop:8}}>
                    <button type="submit" className="search-btn" disabled={marketLoading}>{marketLoading? 'Loading...':'Fetch Market Prices'}</button>
                    <button type="button" className="filter-btn" onClick={() => { setMarketFilters({ State:'Tamil Nadu', District:'Erode', Commodity:'Turmeric', Arrival_Date:'', _date: '' }); setMarketData(null); }}>Reset</button>
                  </div>
                </form>

                <div style={{marginTop:16}}>
                  {marketLoading && <p>Loading market data...</p>}
                  {marketData && marketData.records && marketData.records.length === 0 && <p>No market records found</p>}
                  {marketData && marketData.records && marketData.records.length > 0 && (
                    <div className="market-table">
                      <table>
                        <thead>
                          <tr><th>Date</th><th>Market</th><th>Commodity</th><th>Variety</th><th>Min Price</th><th>Max Price</th></tr>
                        </thead>
                        <tbody>
                          {marketData.records.map((rec, idx) => (
                            <tr key={idx}>
                              <td>{rec.Arrival_Date}</td>
                              <td>{rec.Market}</td>
                              <td>{rec.Commodity}</td>
                              <td>{rec.Variety || '-'}</td>
                              <td>₹{rec.Min_Price || '-'}</td>
                              <td>₹{rec.Max_Price || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && <div className="error-box">{error}</div>}
      </div>
    </div>
  );
};

export default PricePrediction;
