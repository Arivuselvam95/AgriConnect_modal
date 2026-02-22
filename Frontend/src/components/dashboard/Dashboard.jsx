import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  TrendingUp,
  Wheat,
  Cloud,
  LineChart,
  Target,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState('');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeatherError('');
        const city =
          user?.location?.city || user?.district || user?.location?.district || '';
        if (!city) return;

        // lazy-import api to avoid circular issues
        const api = (await import('../../services/api')).default;
        const resp = await api.get('/recommendation/weather', { params: { city } });
        setWeather(resp.data.weather);
      } catch (err) {
        console.error('Failed to fetch weather', err.message || err);
        setWeatherError('Unable to load weather');
      }
    };

    fetchWeather();
  }, [user]);

  const summaryData = [
    {
      title: 'Weather Details',
      value: weather ? `${weather.city}${weather.country ? ', ' + weather.country : ''}` : (user?.location ? `${user.location.city}, ${user.location.state}` : 'Your Location'),
      icon: <Cloud size={28} />,
      color: '#155e63',
      details: weather
        ? {
            temperature: `${Math.round(weather.temperature)}°C`,
            feels_like: `${Math.round(weather.feels_like)}°C`,
            humidity: `${weather.humidity}%`,
            wind: weather.wind ? `${weather.wind.speed} m/s` : 'N/A',
            precipitation: weather.precipitation !== undefined ? `${weather.precipitation}` : '0',
            sunrise: weather.sunrise ? new Date(weather.sunrise).toLocaleTimeString() : null,
            sunset: weather.sunset ? new Date(weather.sunset).toLocaleTimeString() : null,
            description: weather.description || '',
          }
        : null,
    },
  ];

  const modules = [
    {
      title: 'Crop Price Prediction',
      description: 'Get AI-powered price predictions for your crops',
      icon: <LineChart size={40} />,
      gradient: 'linear-gradient(135deg, #155e63 0%, #60a5fa 100%)',
      path: '/price-prediction',
    },
    {
      title: 'Regional Crop Suggestion',
      description: 'Find the best crops for your region and soil',
      icon: <Target size={40} />,
      gradient: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
      path: '/crop-suggestion',
    },
    {
      title: 'Farm Hub',
      description: 'Buy and sell agricultural products',
      icon: <ShoppingBag size={40} />,
      gradient: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
      path: '/farm-hub',
    },
  ];

  const recentActivities = [
    { crop: 'Wheat', price: '₹2,150', date: '2024-03-15', trend: 'up' },
    { crop: 'Rice', price: '₹3,450', date: '2024-03-14', trend: 'up' },
    { crop: 'Cotton', price: '₹5,200', date: '2024-03-13', trend: 'down' },
    { crop: 'Sugarcane', price: '₹3,100', date: '2024-03-12', trend: 'up' },
    { crop: 'Maize', price: '₹1,850', date: '2024-03-11', trend: 'up' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.name || 'Farmer'}!</h1>
            <p>Here's what's happening with your farm today</p>
          </div>
        </div>

        <div className="summary-cards">
          {summaryData.map((item, index) => (
            <div key={index} className="summary-card">
              <div
                className="summary-icon"
                style={{ background: `${item.color}15`, color: item.color }}
              >
                {item.icon}
              </div>
              <div className="summary-content">
                <p className="summary-title">{item.title}</p>
                <h3 className="summary-value">{item.value}</h3>
                {item.details && (
                  <div className="weather-details">
                    <p>Temperature: {item.details.temperature}</p>
                    <p>Feels like: {item.details.feels_like}</p>
                    <p>Humidity: {item.details.humidity}</p>
                    <p>Wind: {item.details.wind}</p>
                    <p>Precipitation: {item.details.precipitation}</p>
                    <p>Sunrise: {item.details.sunrise} • Sunset: {item.details.sunset}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="module-cards">
          {modules.map((module, index) => (
            <div
              key={index}
              className="module-card"
              onClick={() => navigate(module.path)}
            >
              <div className="module-icon" style={{ background: module.gradient }}>
                {module.icon}
              </div>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <button className="module-btn">
                Explore <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* recent market activities removed — replaced by expanded weather details above */}
      </div>
    </div>
  );
};

export default Dashboard;
