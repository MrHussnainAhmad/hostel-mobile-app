import { authApi } from '@/api/auth';
import { User } from '@/types';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;

  setAuth: (user: User, token: string) => Promise<void>;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  isInitialized: false,

  setAuth: async (user, token) => {
    await SecureStore.setItemAsync('token', token);
    set({ user, token, isAuthenticated: true, isLoading: false, isInitialized: true });
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await SecureStore.getItemAsync('token');

      if (!token) {
        set({ isLoading: false, isAuthenticated: false, isInitialized: true });
        return;
      }

      const response = await authApi.getMe();

      if (response.success && response.data) {
        const user = response.data;

        // Block ADMIN and SUBADMIN from mobile app
        if (user.role === 'ADMIN' || user.role === 'SUBADMIN') {
          await SecureStore.deleteItemAsync('token');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false, isInitialized: true });
          return;
        }

        set({ user, token, isAuthenticated: true, isLoading: false, isInitialized: true });
      } else {
        await SecureStore.deleteItemAsync('token');
        set({ isLoading: false, isAuthenticated: false, isInitialized: true });
      }
    } catch (error) {
      await SecureStore.deleteItemAsync('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, isInitialized: true });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));