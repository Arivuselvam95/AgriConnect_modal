import { useState, useEffect, useContext } from 'react';
import { priceService } from '../../services/price.service';
import { AuthContext } from '../../context/AuthContext';
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
  const { logout } = useContext(AuthContext);
  const [cropName, setCropName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [predictionData, setPredictionData] = useState(null);
  const [activeTab, setActiveTab] = useState('trend'); // 'trend' or 'lastweek'
  const [rangeMonths, setRangeMonths] = useState(12); // 3,6,12
  const [activePanel, setActivePanel] = useState('prediction'); // 'prediction' or 'market'
  const [selectedFutureMonthIndex, setSelectedFutureMonthIndex] = useState(0); // 0 = next month, 1 and 2 = next 2/3 months
  const [marketFilters, setMarketFilters] = useState({
    State: 'Tamil Nadu',
    District: 'Erode',
    Commodity: '',
    Arrival_Date: '',
  });
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketData, setMarketData] = useState(null);

  // last week prices states
  const [lastWeekLoading, setLastWeekLoading] = useState(false);
  const [lastWeekData, setLastWeekData] = useState(null);

  const defaultCrops = [
    { name: 'Cabbage', icon: '🥬' },
    { name: 'Maize', icon: '🌽' },
    { name: 'Carrot', icon: '🥕' },
    { name: 'Beans', icon: '🫛' },
    { name: 'Beetroot', icon: '🫜' },
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
      if (err.response?.status === 401) {
        logout();
        window.location.href = '/login';
      }
      setError(err.response?.data?.message || 'Failed to fetch market prices');
    } finally {
      setMarketLoading(false);
    }
  };

  const predictPrice = async (crop) => {
    setLoading(true);
    setError('');
    setActiveTab('trend');
    setSelectedFutureMonthIndex(0);
    setPredictionData(null);
    setLastWeekData(null);

    try {
      const data = await priceService.predictPrice(crop);
      setPredictionData(data);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = '/login';
      }
      setError(err.response?.data?.detail || 'Failed to predict price due to Invalid Crop Name or Service Unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLastWeekPrices = async (crop) => {
    if (!crop) return;
    setLastWeekLoading(true);
    setError('');
    setLastWeekData(null);
    try {
      const data = await priceService.getLastWeekPrices(
        crop, 
        marketFilters.State, 
        marketFilters.District
      );
      setLastWeekData(data);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        window.location.href = '/login';
      }
      setError(err.response?.data?.message || 'Failed to fetch last week prices');
    } finally {
      setLastWeekLoading(false);
    }
  };

  const getChartData = () => {
    if (!predictionData) return null;

    const now = new Date();

    // last 12 month labels ending at current month
    const allLabels = Array(12)
      .fill()
      .map((_, i) => {
        const labelDate = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        return labelDate.toLocaleString('default', { month: 'short' });
      });

    const futureLabels = [1, 2, 3].map((offset) => {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      return futureDate.toLocaleString('default', { month: 'short' });
    });

    const labels = [...allLabels.slice(12 - rangeMonths), ...futureLabels];
    const actualPrices = predictionData.graph_data.actual_prices_last_12_months.slice(
      12 - rangeMonths
    );
    const predictions = predictionData.predicted_prices_next_3_months || predictionData.graph_data.predictions || [];

    return {
      labels,
      datasets: [
        {
          label: 'Actual Price',
          data: [...actualPrices, null, null, null],
          borderColor: '#155e63',
          backgroundColor: 'rgba(21, 94, 99, 0.08)',
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Predicted Price',
          data: [
            ...Array(rangeMonths).fill(null),
            ...predictions,
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

  const getFutureMonthLabels = () => {
    const now = new Date();
    return [1, 2, 3].map((offset) => {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      return futureDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    });
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

  // effect: fetch last week prices when tab switches and crop available
  useEffect(() => {
    if (activeTab === 'lastweek' && predictionData) {
      fetchLastWeekPrices(predictionData.crop || cropName);
    }
  }, [activeTab, predictionData, cropName]);

  return (
    <div className="price-prediction-page">
      <div className="price-container">
        <div className="price-header">
          <h1>Crop Price Prediction</h1>
          <p>AI-powered price forecasting for better decision making</p>
        </div>

        {/* search moved into Prediction panel so it only shows when activePanel === 'prediction' */}

        <div className="tabs" style={{marginBottom: 20}}>
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
                    <p className="label">Next 3 Month Predictions</p>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      {getFutureMonthLabels().map((monthLabel, idx) => {
                        const isActive = selectedFutureMonthIndex === idx;
                        return (
                          <button
                            key={monthLabel}
                            className={`filter-btn ${isActive ? 'active' : ''}`}
                            style={{ minWidth: 80 }}
                            onClick={() => setSelectedFutureMonthIndex(idx)}
                          >
                            {monthLabel}
                          </button>
                        );
                      })}
                    </div>
                    <h1>
                      ₹{(
                        (predictionData.predicted_prices_next_3_months || predictionData.graph_data?.predictions || [])[selectedFutureMonthIndex] || 0
                      ).toFixed(2)}
                    </h1>
                    <p className="label">
                      Showing price for {getFutureMonthLabels()[selectedFutureMonthIndex]}
                    </p>
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
                  <button className={`tab ${activeTab==='lastweek'?'active':''}`} onClick={() => setActiveTab('lastweek')}>Last Week Prices</button>
                </div>

                <div className="chart-container">
                  {activeTab === 'trend' ? (
                    <Line data={getChartData()} options={chartOptions} />
                  ) : (
                    <div className="lastweek-table">
                      {lastWeekLoading && <p>Loading last week prices...</p>}
                      {lastWeekData && lastWeekData.records && lastWeekData.records.length === 0 && (
                        <p>No records found for last week.</p>
                      )}
                      {lastWeekData && lastWeekData.records && lastWeekData.records.length > 0 && (
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
                            {lastWeekData.records.map((rec, idx) => (
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
                      (price, index) => {
                        const monthDate = new Date();
                        monthDate.setMonth(monthDate.getMonth() - (11 - index));
                        const monthLabel = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
                        return (
                          <tr key={index}>
                            <td>{monthLabel}</td>
                            <td>₹{price.toFixed(2)}</td>
                          </tr>
                        );
                      }
                    )}
                    {(predictionData.predicted_prices_next_3_months || predictionData.graph_data?.predictions || []).map((price, index) => (
                      <tr key={`pred-${index}`} className="predicted-row">
                        <td>Predicted (Month +{index + 1})</td>
                        <td className="predicted-value">
                          ₹{price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
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
                          {marketData.records.sort((x ,y)=> y.Arrival_Date - x.Arrival_Date).map((rec, idx) => (
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
