import { useContext } from 'react';
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

  const summaryData = [
    {
      title: 'Current Market Value',
      value: '₹3,450/q',
      change: '+12%',
      icon: <TrendingUp size={28} />,
      color: '#2e7d32',
    },
    {
      title: 'Recommended Crop',
      value: 'Rice',
      change: '85% match',
      icon: <Wheat size={28} />,
      color: '#f57c00',
    },
    {
      title: 'Weather Forecast',
      value: '28°C',
      change: 'Partly Cloudy',
      icon: <Cloud size={28} />,
      color: '#1976d2',
    },
  ];

  const modules = [
    {
      title: 'Crop Price Prediction',
      description: 'Get AI-powered price predictions for your crops',
      icon: <LineChart size={40} />,
      gradient: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
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
                <span className="summary-change" style={{ color: item.color }}>
                  {item.change}
                </span>
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

        <div className="activities-section">
          <h2>Recent Market Activities</h2>
          <div className="activities-table-container">
            <table className="activities-table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Price (per quintal)</th>
                  <th>Date</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity, index) => (
                  <tr key={index}>
                    <td className="crop-name">{activity.crop}</td>
                    <td className="price">{activity.price}</td>
                    <td>{activity.date}</td>
                    <td>
                      <span className={`trend trend-${activity.trend}`}>
                        {activity.trend === 'up' ? '↑' : '↓'}{' '}
                        {activity.trend === 'up' ? 'Rising' : 'Falling'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
