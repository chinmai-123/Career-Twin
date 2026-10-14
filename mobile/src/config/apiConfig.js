import storage from '../utils/storage';
import { Platform } from 'react-native';

const STORAGE_KEY = '@careertwin_api_base_url';

// Default presets
export const PRESETS = {
  PHYSICAL_DEVICE: 'http://192.168.1.13:8085/api',
  ANDROID_EMULATOR: 'http://10.0.2.2:8085/api',
  LOCALHOST: 'http://localhost:8085/api',
};

// Default fallback depending on environment
const getDefaultBaseUrl = () => {
  if (Platform.OS === 'android') {
    return PRESETS.PHYSICAL_DEVICE;
  }
  return PRESETS.LOCALHOST;
};

let currentBaseUrl = getDefaultBaseUrl();

export const initBaseUrl = async () => {
  try {
    const saved = await storage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) {
      currentBaseUrl = saved.trim();
      return currentBaseUrl;
    }

    // Auto-detect environment if no manual override is saved
    if (Platform.OS === 'android') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);
        const res = await fetch('http://10.0.2.2:8085/api/auth/demo-credentials', {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          // Detected running inside Android Studio / AVD Emulator
          currentBaseUrl = PRESETS.ANDROID_EMULATOR;
          return currentBaseUrl;
        }
      } catch (e) {
        // Not on emulator or 10.0.2.2 timed out -> use physical LAN IP
        currentBaseUrl = PRESETS.PHYSICAL_DEVICE;
      }
    }
  } catch (err) {
    // Silent fallback
  }
  return currentBaseUrl;
};

export const getBaseUrl = () => currentBaseUrl;

export const setCustomBaseUrl = async (url) => {
  if (!url || !url.trim()) return false;
  let formatted = url.trim();
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
    formatted = 'http://' + formatted;
  }
  if (!formatted.endsWith('/api')) {
    formatted = formatted.replace(/\/+$/, '') + '/api';
  }
  try {
    await storage.setItem(STORAGE_KEY, formatted);
    currentBaseUrl = formatted;
    return formatted;
  } catch (err) {
    console.error('Error saving API URL:', err);
    return false;
  }
};

export const resetBaseUrlToDefault = async () => {
  try {
    await storage.removeItem(STORAGE_KEY);
    currentBaseUrl = getDefaultBaseUrl();
    return currentBaseUrl;
  } catch (err) {
    console.error('Error resetting API URL:', err);
    return false;
  }
};
