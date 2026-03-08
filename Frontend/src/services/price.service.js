import api from './api';

export const priceService = {
  predictPrice: async (crop) => {
    const response = await api.post('/price/predict', { crop });
    return response.data;
  },
  getMarketPrices: async (filters) => {
    const response = await api.get('/price/market', { params: filters });
    return response.data;
  },
  getLastWeekPrices: async (crop, state = 'Tamil Nadu', district = 'Erode') => {
    const response = await api.get('/price/last-week', {
      params: { 
        State: state,
        District: district,
        Commodity: crop
      },
    });
    return response.data;
  },
};
