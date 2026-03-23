import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Sprout, Bell, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    mobile: '',
    state: '',
    district: '',
    role: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    setProfileData({
      name: user.name || '',
      mobile: user.mobile || '',
      state: user.state || '',
      district: user.district || '',
      role: user.role || '',
    });
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenProfile = () => {
    setProfileError('');
    setProfileSuccess('');
    setIsEditing(false);
    setShowProfileModal(true);
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
  };

  const handleEditProfile = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const data = await updateProfile({
        name: profileData.name,
        state: profileData.state,
        district: profileData.district,
      });

      setProfileSuccess(data.message || 'Profile updated successfully.');
      setShowProfileModal(false);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
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

          <div className="user-info" onClick={handleOpenProfile} style={{ cursor: 'pointer' }}>
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

      {showProfileModal && (
        <div className="profile-modal-overlay" onClick={handleCloseProfile}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Profile</h3>

            <form onSubmit={handleSaveProfile} className="profile-form">
              <label>
                Name
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                  disabled={!isEditing}
                />
              </label>
              <label>
                Mobile
                <input type="text" value={profileData.mobile} disabled />
              </label>
              <label>
                State
                <input
                  type="text"
                  value={profileData.state}
                  onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                  required
                  disabled={!isEditing}
                />
              </label>
              <label>
                District
                <input
                  type="text"
                  value={profileData.district}
                  onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                  required
                  disabled={!isEditing}
                />
              </label>
              <label>
                Role
                <input type="text" value={profileData.role} disabled />
              </label>

              {profileError && <p className="profile-error">{profileError}</p>}
              {profileSuccess && <p className="profile-success">{profileSuccess}</p>}
            </form>

            <div className="profile-actions">
              <button type="button" className="cancel-btn" onClick={handleCloseProfile}>
                Close
              </button>
              {!isEditing ? (
                <button type="button" className="save-btn" onClick={handleEditProfile}>
                  Edit Profile
                </button>
              ) : (
                <button type="button" className="save-btn" onClick={handleSaveProfile} disabled={profileLoading}>
                  {profileLoading ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
