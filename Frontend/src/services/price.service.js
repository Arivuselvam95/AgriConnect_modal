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
  getYesterdayPrices: async (crop) => {
    // format yesterday's date as DD/MM/YYYY
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000);
    const dd = String(yesterday.getDate()).padStart(2, '0');
    const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
    const yyyy = yesterday.getFullYear();
    const formatted = `${dd}/${mm}/${yyyy}`;

    const response = await api.get('/price/market', {
      params: { Commodity: crop, Arrival_Date: formatted },
    });
    return response.data;
  },
};
