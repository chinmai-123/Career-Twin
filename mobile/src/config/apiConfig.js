import storage from '../utils/storage';
import { Platform, NativeModules } from 'react-native';

const STORAGE_KEY = '@careertwin_api_base_url';

export const CURRENT_HOST_IP = '192.168.1.33';

// Default presets
export const PRESETS = {
  PHYSICAL_DEVICE: `http://${CURRENT_HOST_IP}:8085/api`,
  ANDROID_EMULATOR: 'http://10.0.2.2:8085/api',
  LOCALHOST: 'http://localhost:8085/api',
};

// Auto-detect Metro Bundler Host IP if running via Expo / Dev
export const getAutoDetectedHost = () => {
  try {
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/(?:https?|exp):\/\/([^/:]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return `http://${match[1]}:8085/api`;
      }
    }
  } catch (e) {
    // silent
  }
  return null;
};

// Default fallback depending on environment
const getDefaultBaseUrl = () => {
  const auto = getAutoDetectedHost();
  if (auto) return auto;
  if (Platform.OS === 'android') {
    return PRESETS.PHYSICAL_DEVICE;
  }
  return PRESETS.LOCALHOST;
};

let currentBaseUrl = getDefaultBaseUrl();

export const initBaseUrl = async () => {
  try {
    const saved = await storage.getItem(STORAGE_KEY);
    // Ignore legacy hardcoded IP if DHCP reallocated
    if (saved && saved.trim() && !saved.includes('192.168.1.13')) {
      currentBaseUrl = saved.trim();
      return currentBaseUrl;
    }

    // Auto-detect if running on Android Studio / AVD Emulator
    if (Platform.OS === 'android') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 800);
        const res = await fetch('http://10.0.2.2:8085/api/auth/demo-credentials', {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          currentBaseUrl = PRESETS.ANDROID_EMULATOR;
          return currentBaseUrl;
        }
      } catch (e) {
        // Not on emulator
      }
    }

    // Auto-detect from Metro bundler host IP
    const auto = getAutoDetectedHost();
    if (auto) {
      currentBaseUrl = auto;
      return currentBaseUrl;
    }

    currentBaseUrl = getDefaultBaseUrl();
  } catch (err) {
    currentBaseUrl = getDefaultBaseUrl();
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
