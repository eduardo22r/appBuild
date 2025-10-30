import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress } from '../types';

const STORAGE_KEYS = {
  SELECTED_LANGUAGE: 'selectedLanguage',
  USER_PROGRESS: 'userProgress',
  USER_NAME: 'userName',
};

export const storage = {
  async setSelectedLanguage(languageId: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_LANGUAGE, languageId);
  },

  async getSelectedLanguage(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_LANGUAGE);
  },

  async setUserProgress(progress: UserProgress[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
  },

  async getUserProgress(): Promise<UserProgress[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    return data ? JSON.parse(data) : [];
  },

  async setUserName(name: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, name);
  },

  async getUserName(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  },
};
