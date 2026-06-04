import AsyncStorage from '@react-native-async-storage/async-storage';
import type { KeyValueStore } from '../../../src/shared-core/platform/types';

export const asyncStorageStore: KeyValueStore = {
  async get<T = unknown>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as T;
    }
  },

  async set<T>(key: string, value: T) {
    await AsyncStorage.setItem(
      key,
      typeof value === 'string' ? value : JSON.stringify(value),
    );
  },

  async clearAll() {
    await AsyncStorage.clear();
  },

  async remove(key: string) {
    await AsyncStorage.removeItem(key);
  },
};
