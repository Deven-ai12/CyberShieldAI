import apiClient from './apiClient.js';

export const adminService = {
  logs: () => apiClient.get('/api/admin/logs'),
};
