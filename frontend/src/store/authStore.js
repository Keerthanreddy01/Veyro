import { create } from 'zustand';
import api from '../api/axios';

/**
 * Zustand auth store — single source of truth for auth state.
 * Persists tokens to localStorage for page-refresh survival.
 */
const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  loading: false,
  error: null,

  setTokens: (accessToken, refreshToken, user) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({ accessToken, refreshToken, user, error: null });
  },

  register: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      get().setTokens(data.accessToken, data.refreshToken, data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      get().setTokens(data.accessToken, data.refreshToken, data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', { refreshToken: get().refreshToken });
    } catch {}
    localStorage.clear();
    set({ user: null, accessToken: null, refreshToken: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
