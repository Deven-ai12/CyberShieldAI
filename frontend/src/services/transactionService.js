import apiClient from './apiClient.js';

export const transactionService = {
  transfer: (payload) => apiClient.post('/api/transactions/transfer', payload),
};
