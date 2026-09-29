import apiClient from './apiClient.js';

export const threatService = {
  liveThreats: () => apiClient.get('/api/threats/live'),
};
