import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './StorageKeys';

export const storageService = {
  async get<T>(key: string): Promise<T | null> {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};

export const onboardingStorage = {
  async isCompleted(): Promise<boolean> {
    const value = await storageService.get<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return value ?? false;
  },

  async setCompleted(): Promise<void> {
    await storageService.set(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
  },
};

export const authStorage = {
  async getToken(): Promise<string | null> {
    return storageService.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  },

  async setToken(token: string): Promise<void> {
    await storageService.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  async clearToken(): Promise<void> {
    await storageService.remove(STORAGE_KEYS.AUTH_TOKEN);
  },
};