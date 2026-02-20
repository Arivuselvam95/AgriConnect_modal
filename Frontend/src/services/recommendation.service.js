import api from './api';

export const recommendationService = {
  recommendCrop: async (data) => {
    const response = await api.post('/recommendation/recommend', data);
    return response.data;
  },

  getAllCrops: async () => {
    const response = await api.get('/crops');
    return response.data;
  },
};
