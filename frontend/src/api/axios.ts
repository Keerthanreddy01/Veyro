import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

/**
 * API Base URL:
 * - In Development (default): Falls back to '/api' and uses Vite's dev proxy to http://localhost:5000/api
 * - In Production (Vercel): Uses the VITE_API_URL environment variable (e.g. https://your-backend.onrender.com/api)
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: AxiosError) => void }> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config;
    if (!original) return Promise.reject(error);
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve: resolve as (token: string) => void, reject: reject as (error: AxiosError) => void });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (err) {
        const refreshError = err instanceof AxiosError ? err : error;
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
