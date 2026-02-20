import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Sprout, Bell, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/dashboard" className="navbar-logo">
            <Sprout size={28} />
            <span>AgriConnect</span>
          </Link>

          <div className="navbar-links">
            <Link
              to="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              to="/price-prediction"
              className={`nav-link ${isActive('/price-prediction') ? 'active' : ''}`}
            >
              Price Prediction
            </Link>
            <Link
              to="/crop-suggestion"
              className={`nav-link ${isActive('/crop-suggestion') ? 'active' : ''}`}
            >
              Crop Suggestion
            </Link>
            <Link
              to="/farm-hub"
              className={`nav-link ${isActive('/farm-hub') ? 'active' : ''}`}
            >
              Farm Hub
            </Link>
          </div>
        </div>

        <div className="navbar-right">
          <button className="notification-btn">
            <Bell size={20} />
          </button>

          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{user?.role || 'Farmer'}</span>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
