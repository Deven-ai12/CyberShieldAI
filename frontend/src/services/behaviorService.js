import apiClient from './apiClient.js';

export const behaviorService = {
  trackBehavior: (payload) => apiClient.post('/api/behavior/track', payload),
  getLiveSession: () => apiClient.get('/api/session/live'),
  getRiskScore: () => apiClient.get('/api/risk-score'),
};
