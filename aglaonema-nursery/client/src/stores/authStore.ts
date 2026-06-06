import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  phone?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),

      login: async (email, password, remember = false) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password, remember });
          set({ user: data.user, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (name, email, password, phone) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', { name, email, password, phone });
          set({ user: data.user, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        await api.post('/auth/logout');
        set({ user: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user });
        } catch {
          set({ user: null });
        }
      },
    }),
    { name: 'auth-store', partialize: (state) => ({ user: state.user }) }
  )
);

// Admin auth store
interface AdminAuthState {
  admin: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAdminStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,

      login: async (email, password) => {
        const { data } = await api.post('/admin/auth/login', { email, password });
        set({ admin: data.user });
      },

      logout: async () => {
        await api.post('/admin/auth/logout');
        set({ admin: null });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/admin/auth/me');
          set({ admin: data.user });
        } catch {
          set({ admin: null });
        }
      },
    }),
    { name: 'admin-store', partialize: (state) => ({ admin: state.admin }) }
  )
);
