import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';
import { normalizeApiError } from '../services/apiClient.js';
import { getDeviceFingerprint, getDeviceProfile } from '../utils/device.js';

const AuthContext = createContext(null);
const demoFallbackEnabled = import.meta.env.VITE_ENABLE_DEMO_FALLBACK !== 'false';

function createDemoUser(email) {
  return {
    id: 'demo-bank-user',
    name: email?.split('@')[0]?.replace(/[._]/g, ' ') || 'Security Analyst',
    email: email || 'analyst@neuroshield.ai',
    role: 'SOC_ANALYST',
    accountTier: 'Private Banking',
    deviceFingerprint: getDeviceFingerprint(),
    lastLogin: new Date().toISOString(),
  };
}

function responseBody(response) {
  return response.data?.data || response.data || {};
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('neuroshield.token');
    const storedUser = localStorage.getItem('neuroshield.user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setInitializing(false);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      localStorage.removeItem('neuroshield.token');
      localStorage.removeItem('neuroshield.user');
      setToken(null);
      setUser(null);
    };
    window.addEventListener('neuroshield:unauthorized', onUnauthorized);
    return () => window.removeEventListener('neuroshield:unauthorized', onUnauthorized);
  }, []);

  const persistSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem('neuroshield.token', nextToken);
    localStorage.setItem('neuroshield.user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (credentials) => {
      setAuthError('');
      try {
        const response = await authService.login({
          ...credentials,
          deviceFingerprint: getDeviceFingerprint(),
          deviceProfile: getDeviceProfile(),
        });
        const body = responseBody(response);
        const nextToken = body.token || body.jwt || body.accessToken;
        const nextUser = body.user || body.profile || createDemoUser(credentials.email);
        if (!nextToken) {
          throw new Error('Login response did not include a JWT token');
        }
        persistSession(nextToken, nextUser);
        return nextUser;
      } catch (error) {
        if (!demoFallbackEnabled) {
          const message = normalizeApiError(error);
          setAuthError(message);
          throw new Error(message);
        }
        const nextUser = createDemoUser(credentials.email);
        persistSession(`demo-jwt-${Date.now()}`, nextUser);
        return nextUser;
      }
    },
    [persistSession],
  );

  const register = useCallback(
    async (payload) => {
      setAuthError('');
      try {
        const response = await authService.register(payload);
        return responseBody(response);
      } catch (error) {
        if (!demoFallbackEnabled) {
          const message = normalizeApiError(error);
          setAuthError(message);
          throw new Error(message);
        }
        return {
          email: payload.email,
          message: 'Demo OTP sent',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        };
      }
    },
    [],
  );

  const verifyEmailOtp = useCallback(
    async (payload) => {
      setAuthError('');
      try {
        const response = await authService.verifyEmailOtp({
          ...payload,
          deviceFingerprint: getDeviceFingerprint(),
          deviceProfile: getDeviceProfile(),
        });
        const body = responseBody(response);
        const nextToken = body.token || body.jwt || body.accessToken;
        const nextUser = body.user || body.profile || createDemoUser(payload.email);
        if (!nextToken) {
          throw new Error('Email verification response did not include a JWT token');
        }
        persistSession(nextToken, nextUser);
        return nextUser;
      } catch (error) {
        if (!demoFallbackEnabled) {
          const message = normalizeApiError(error);
          setAuthError(message);
          throw new Error(message);
        }
        const nextUser = createDemoUser(payload.email);
        persistSession(`demo-jwt-${Date.now()}`, nextUser);
        return nextUser;
      }
    },
    [persistSession],
  );

  const resendEmailOtp = useCallback(async (email) => {
    setAuthError('');
    try {
      const response = await authService.resendEmailOtp({ email });
      return responseBody(response);
    } catch (error) {
      const message = normalizeApiError(error);
      setAuthError(message);
      throw new Error(message);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setAuthError('');
    try {
      const response = await authService.forgotPassword({ email });
      return responseBody(response);
    } catch (error) {
      const message = normalizeApiError(error);
      setAuthError(message);
      throw new Error(message);
    }
  }, []);

  const verifyResetOtp = useCallback(async (payload) => {
    setAuthError('');
    try {
      const response = await authService.verifyResetOtp(payload);
      return responseBody(response);
    } catch (error) {
      const message = normalizeApiError(error);
      setAuthError(message);
      throw new Error(message);
    }
  }, []);

  const resetPassword = useCallback(async (payload) => {
    setAuthError('');
    try {
      const response = await authService.resetPassword(payload);
      return responseBody(response);
    } catch (error) {
      const message = normalizeApiError(error);
      setAuthError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('neuroshield.token');
    localStorage.removeItem('neuroshield.user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      authError,
      initializing,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      register,
      verifyEmailOtp,
      resendEmailOtp,
      forgotPassword,
      verifyResetOtp,
      resetPassword,
    }),
    [
      authError,
      forgotPassword,
      initializing,
      login,
      logout,
      register,
      resendEmailOtp,
      resetPassword,
      token,
      user,
      verifyEmailOtp,
      verifyResetOtp,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
