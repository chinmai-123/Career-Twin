import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory fallback if native module is not yet ready
const memoryStore = new Map();

export const storage = {
  getItem: async (key) => {
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const val = await AsyncStorage.getItem(key);
        if (val !== null && val !== undefined) return val;
      }
    } catch (e) {
      // Silently fall back to in-memory store
    }
    return memoryStore.has(key) ? memoryStore.get(key) : null;
  },

  setItem: async (key, value) => {
    memoryStore.set(key, value);
    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e) {
      // Persisted in memory fallback
    }
  },

  removeItem: async (key) => {
    memoryStore.delete(key);
    try {
      if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      // Cleared from memory fallback
    }
  },
};

export default storage;
