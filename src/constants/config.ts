const isDev = __DEV__;

export const CONFIG = {
  API_URL: isDev 
    ? 'http://192.168.3.202:5000/api'  // Local backend
    : 'https://backend-2-pn6z.onrender.com/api', // Production
  APP_NAME: 'HostelsHub',
} as const;