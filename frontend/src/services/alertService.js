import apiClient from './apiClient.js';

export const alertService = {
  sendAlert: (payload) => apiClient.post('/api/alerts/send', payload),
};
