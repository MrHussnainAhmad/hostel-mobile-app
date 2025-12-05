import { Router } from 'expo-router';

export const safeGoBack = (router: Router, fallbackRoute: string = '/') => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackRoute as any);
  }
};