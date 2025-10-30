import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, UserProgress } from '../types';
import { storage } from '../utils/storage';
import { LANGUAGES } from '../data/languages';
import NetworkService from '../services/NetworkService';
import CloudSyncService from '../services/CloudSyncService';

interface AppContextType {
  selectedLanguage: Language | null;
  setSelectedLanguage: (language: Language) => void;
  userProgress: UserProgress[];
  updateProgress: (languageId: string, lessonId: string, wordIds: string[]) => void;
  userName: string;
  setUserName: (name: string) => void;
  isLoading: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncNow: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguageState] = useState<Language | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [userName, setUserNameState] = useState<string>('Learner');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    initializeApp();

    return () => {
      NetworkService.cleanup();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize network service
      NetworkService.initialize();
      NetworkService.addListener(handleNetworkChange);

      // Initialize cloud sync
      const userId = `user-${Date.now()}`; // In production, use real user ID
      CloudSyncService.initialize(userId);
      CloudSyncService.addSyncListener(handleSyncStatusChange);

      // Load local data
      const [savedLanguageId, savedProgress, savedName] = await Promise.all([
        storage.getSelectedLanguage(),
        storage.getUserProgress(),
        storage.getUserName(),
      ]);

      if (savedLanguageId) {
        const language = LANGUAGES.find(l => l.id === savedLanguageId);
        if (language) setSelectedLanguageState(language);
      }

      if (savedProgress.length > 0) {
        setUserProgress(savedProgress);
      }

      if (savedName) {
        setUserNameState(savedName);
      }

      // Try to fetch from cloud if online
      const isConnected = await NetworkService.checkConnection();
      if (isConnected && CloudSyncService.needsSync()) {
        const cloudProgress = await CloudSyncService.fetchProgress();
        if (cloudProgress) {
          setUserProgress(cloudProgress);
          await storage.setUserProgress(cloudProgress);
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNetworkChange = async (connected: boolean) => {
    setIsOnline(connected);

    if (connected) {
      console.log('✓ Back online - syncing data...');
      // Process any queued syncs
      await CloudSyncService.processSyncQueue();

      // Sync current data
      if (userProgress.length > 0) {
        await CloudSyncService.syncProgress(userProgress);
      }
    } else {
      console.log('✗ Offline - data will sync when reconnected');
    }
  };

  const handleSyncStatusChange = (status: any) => {
    setIsSyncing(status.isSyncing);
    if (status.lastSyncTime) {
      setLastSyncTime(status.lastSyncTime);
    }
  };

  const setSelectedLanguage = async (language: Language) => {
    setSelectedLanguageState(language);
    await storage.setSelectedLanguage(language.id);
  };

  const setUserName = async (name: string) => {
    setUserNameState(name);
    await storage.setUserName(name);
  };

  const updateProgress = async (languageId: string, lessonId: string, wordIds: string[]) => {
    const existingProgress = userProgress.find(p => p.languageId === languageId);

    let newProgress: UserProgress[];

    if (existingProgress) {
      newProgress = userProgress.map(p => {
        if (p.languageId === languageId) {
          const newCompletedLessons = p.completedLessons.includes(lessonId)
            ? p.completedLessons
            : [...p.completedLessons, lessonId];

          const newMasteredWords = [...new Set([...p.masteredWords, ...wordIds])];

          return {
            ...p,
            completedLessons: newCompletedLessons,
            masteredWords: newMasteredWords,
            score: p.score + wordIds.length * 10,
            lastStudied: new Date(),
          };
        }
        return p;
      });
    } else {
      newProgress = [
        ...userProgress,
        {
          languageId,
          completedLessons: [lessonId],
          masteredWords: wordIds,
          score: wordIds.length * 10,
          streak: 1,
          lastStudied: new Date(),
        },
      ];
    }

    setUserProgress(newProgress);
    await storage.setUserProgress(newProgress);

    // Auto-sync to cloud
    await CloudSyncService.autoSync(newProgress);
  };

  const syncNow = async () => {
    if (!isOnline) {
      console.log('Cannot sync while offline');
      return;
    }

    await CloudSyncService.syncProgress(userProgress);
  };

  return (
    <AppContext.Provider
      value={{
        selectedLanguage,
        setSelectedLanguage,
        userProgress,
        updateProgress,
        userName,
        setUserName,
        isLoading,
        isOnline,
        isSyncing,
        lastSyncTime,
        syncNow,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
