import { CONFIG } from '@/constants/config';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const apiClient = axios.create({
  baseURL: CONFIG.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =========================
// REQUEST INTERCEPTOR
// =========================
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// RESPONSE INTERCEPTOR
// - clears token on 401/403 so user is fully logged out
//   (works nicely with account deletion)
// =========================
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      // remove token so app auth state can reset
      await SecureStore.deleteItemAsync('token');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
