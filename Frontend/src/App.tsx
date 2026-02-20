import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import PricePrediction from './components/price/PricePrediction';
import CropRecommendation from './components/recommendation/CropRecommendation';
import FarmHub from './components/farmhub/FarmHub';
import './App.css';

function AppContent() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Dashboard />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/price-prediction"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <PricePrediction />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/crop-suggestion"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <CropRecommendation />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/farm-hub"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <FarmHub />
            </>
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
