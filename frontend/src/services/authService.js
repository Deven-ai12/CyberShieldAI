import apiClient from './apiClient.js';

export const authService = {
  login: (payload) => apiClient.post('/api/auth/login', payload),
  register: (payload) => apiClient.post('/api/auth/register', payload),
  verifyEmailOtp: (payload) => apiClient.post('/api/auth/verify-email-otp', payload),
  resendEmailOtp: (payload) => apiClient.post('/api/auth/resend-email-otp', payload),
  forgotPassword: (payload) => apiClient.post('/api/auth/forgot-password', payload),
  verifyResetOtp: (payload) => apiClient.post('/api/auth/verify-reset-otp', payload),
  resetPassword: (payload) => apiClient.post('/api/auth/reset-password', payload),
  profile: () => apiClient.get('/api/user/profile'),
};
