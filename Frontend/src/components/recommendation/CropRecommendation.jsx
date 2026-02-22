import { useState, useContext, useEffect } from 'react';
import { recommendationService } from '../../services/recommendation.service';
import { AuthContext } from '../../context/AuthContext';
import {
  Cloud,
  Droplets,
  Thermometer,
  Award,
  Leaf,
} from 'lucide-react';
import './CropRecommendation.css';

const CropRecommendation = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('recommendation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [allCrops, setAllCrops] = useState([]);

  const [formData, setFormData] = useState({
    Nitrogen: '',
    Phosphorus: '',
    Potassium: '',
    pH_Value: '',
    soilType: '',
  });

  useEffect(() => {
    if (activeTab === 'all-crops') {
      fetchAllCrops();
    }
  }, [activeTab]);

  const fetchAllCrops = async () => {
    try {
      const data = await recommendationService.getAllCrops();
      setAllCrops(data.crops || []);
    } catch (err) {
      console.error('Failed to fetch crops');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const { soilType, ...dataToSend } = formData;
      const data = await recommendationService.recommendCrop({
        ...dataToSend,
        district: user?.district || 'Chennai',
        Nitrogen: parseFloat(dataToSend.Nitrogen),
        Phosphorus: parseFloat(dataToSend.Phosphorus),
        Potassium: parseFloat(dataToSend.Potassium),
        pH_Value: parseFloat(dataToSend.pH_Value),
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendation-page">
      <div className="recommendation-container">
        <div className="recommendation-header">
          <h1>Crop Recommendation System</h1>
          <p>Smart recommendations based on soil and weather conditions</p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'recommendation' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendation')}
          >
            Get Recommendation
          </button>
          <button
            className={`tab ${activeTab === 'all-crops' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-crops')}
          >
            All Crops Data
          </button>
        </div>

        {activeTab === 'recommendation' && (
          <div className="tab-content">
            <form onSubmit={handleSubmit} className="recommendation-form">
              {error && <div className="error-box">{error}</div>}

              <div className="form-section">
                <h3>Location Information</h3>
                <div className="form-grid">
                  <div className="form-group disabled-field">
                    <label>District</label>
                    <input
                      type="text"
                      value={user?.district || 'Not set'}
                      disabled
                    />
                    <small>Auto-filled from your profile</small>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Soil Parameters</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="Nitrogen">Nitrogen (kg/ha)</label>
                    <input
                      type="number"
                      id="Nitrogen"
                      name="Nitrogen"
                      value={formData.Nitrogen}
                      onChange={handleChange}
                      placeholder="e.g., 90"
                      required
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="Phosphorus">Phosphorus (kg/ha)</label>
                    <input
                      type="number"
                      id="Phosphorus"
                      name="Phosphorus"
                      value={formData.Phosphorus}
                      onChange={handleChange}
                      placeholder="e.g., 42"
                      required
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="Potassium">Potassium (kg/ha)</label>
                    <input
                      type="number"
                      id="Potassium"
                      name="Potassium"
                      value={formData.Potassium}
                      onChange={handleChange}
                      placeholder="e.g., 43"
                      required
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pH_Value">pH Value</label>
                    <input
                      type="number"
                      id="pH_Value"
                      name="pH_Value"
                      value={formData.pH_Value}
                      onChange={handleChange}
                      placeholder="e.g., 6.5"
                      required
                      step="0.01"
                      min="0"
                      max="14"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="soilType">Soil Type</label>
                    <select
                      id="soilType"
                      name="soilType"
                      value={formData.soilType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select soil type</option>
                      <option value="Clay">Clay</option>
                      <option value="Sandy">Sandy</option>
                      <option value="Loamy">Loamy</option>
                      <option value="Silty">Silty</option>
                      <option value="Peaty">Peaty</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Analyzing...' : 'Get Recommendation'}
              </button>
            </form>

            {result && (
              <div className="results-section">
                <div className="weather-card">
                  <h3>
                    <Cloud size={24} />
                    Weather Conditions - {result.weather.district}
                  </h3>
                  <div className="weather-grid">
                    <div className="weather-item">
                      <Thermometer size={32} color="#f57c00" />
                      <div>
                        <p className="label">Temperature</p>
                        <p className="value">{result.weather.temperature}°C</p>
                      </div>
                    </div>
                    <div className="weather-item">
                      <Droplets size={32} color="#1976d2" />
                      <div>
                        <p className="label">Humidity</p>
                        <p className="value">{result.weather.humidity}%</p>
                      </div>
                    </div>
                    <div className="weather-item">
                      <Cloud size={32} color="#155e63" />
                      <div>
                        <p className="label">Rainfall</p>
                        <p className="value">{result.weather.rainfall} mm</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="recommendations">
                  <h3>
                    <Award size={24} />
                    Top 3 Recommended Crops
                  </h3>
                  <div className="crop-results">
                    {result.recommendation.top_3_crops.map((crop, index) => (
                      <div key={index} className={`crop-result rank-${index + 1}`}>
                        <div className="crop-header">
                          <span className="rank">#{index + 1}</span>
                          <h4>{crop.crop}</h4>
                        </div>
                        <div className="confidence-bar">
                          <div className="confidence-label">
                            <span>Confidence</span>
                            <span className="confidence-value">
                              {(crop.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${crop.confidence * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'all-crops' && (
          <div className="tab-content">
            <div className="crops-grid">
              {allCrops.map((crop, index) => (
                <div key={index} className="crop-info-card">
                  <div className="crop-info-header">
                    <Leaf size={24} color="#155e63" />
                    <h4>{crop.crop}</h4>
                  </div>
                  <div className="crop-info-body">
                    <div className="info-row">
                      <span className="info-label">Nitrogen:</span>
                      <span className="info-value">{crop.Nitrogen} kg/ha</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Phosphorus:</span>
                      <span className="info-value">{crop.Phosphorus} kg/ha</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Potassium:</span>
                      <span className="info-value">{crop.Potassium} kg/ha</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">pH Range:</span>
                      <span className="info-value">{crop.pH_min} - {crop.pH_max}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Temperature Range:</span>
                      <span className="info-value">{crop.temperature_min} - {crop.temperature_max}°C</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropRecommendation;
