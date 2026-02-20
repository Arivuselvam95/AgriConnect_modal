import api from './api';

export const priceService = {
  predictPrice: async (crop) => {
    const response = await api.post('/price/predict', { crop });
    return response.data;
  },
};
