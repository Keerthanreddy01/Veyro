import { create } from 'zustand';
import api from '../api/axios';
import type { AuthResponse, AuthStore, AuthUser, SelfAssignableRole } from '../types/auth';

/**
 * Zustand auth store — single source of truth for auth state.
 * Persists tokens to localStorage for page-refresh survival.
 */
const readUser = (): AuthUser | null => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) as AuthUser : null;
  } catch {
    return null;
  }
};

const useAuthStore = create<AuthStore>((set, get) => ({
  user: readUser(),
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

  register: async (name: string, email: string, password: string, role?: SelfAssignableRole) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password, role });
      get().setTokens(data.accessToken, data.refreshToken, data.user);
      return data.user;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
      get().setTokens(data.accessToken, data.refreshToken, data.user);
      return data.user;
    } catch (err: any) {
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
