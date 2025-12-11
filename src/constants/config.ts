const isDev = __DEV__;

export const CONFIG = {
  // For mobile emulators/devices, 'localhost' refers to the device itself.
  // Use '10.0.2.2' for Android emulator to connect to host machine's localhost.
  // For iOS simulator or physical device, replace '10.0.2.2' with your host machine's local IP address (e.g., 'http://192.168.1.X:5000/api').
  API_URL: isDev 
    ? 'http://192.168.1.57:5000/api'  // Local backend (Android emulator)
    : 'https://backend-2-pn6z.onrender.com/api', // Production (change for actual deployment)
  APP_NAME: 'HostelsHub',
} as const;