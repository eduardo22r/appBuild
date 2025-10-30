import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, UserProgress } from '../types';
import { storage } from '../utils/storage';
import { LANGUAGES } from '../data/languages';
import NetworkService from '../services/NetworkService';
import CloudSyncService from '../services/CloudSyncService';
import AuthService, { AuthUser } from '../services/AuthService';

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
  isAuthenticated: boolean;
  authUser: AuthUser | null;
  handleLoginSuccess: () => void;
  handleLogout: () => Promise<void>;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    initializeApp();

    // Add authentication listener
    const removeAuthListener = AuthService.addAuthListener((user) => {
      setAuthUser(user);
      setIsAuthenticated(user !== null);

      // Update user name when authenticated
      if (user) {
        setUserNameState(user.displayName || user.email || 'Learner');
      }
    });

    return () => {
      NetworkService.cleanup();
      removeAuthListener();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Check authentication status
      const currentUser = AuthService.getCurrentUser();
      setAuthUser(currentUser);
      setIsAuthenticated(currentUser !== null);

      // Initialize network service
      NetworkService.initialize();
      NetworkService.addListener(handleNetworkChange);

      // Initialize cloud sync with user ID
      const userId = currentUser?.uid || `guest-${Date.now()}`;
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

      // Set user name from auth user or saved name
      if (currentUser?.displayName) {
        setUserNameState(currentUser.displayName);
      } else if (savedName) {
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

  const handleLoginSuccess = () => {
    // Refresh app state after login
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setAuthUser(currentUser);
      setIsAuthenticated(true);
      setUserNameState(currentUser.displayName || currentUser.email || 'Learner');

      // Re-initialize cloud sync with authenticated user ID
      CloudSyncService.initialize(currentUser.uid);

      // Sync progress after login
      if (userProgress.length > 0 && isOnline) {
        CloudSyncService.syncProgress(userProgress);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      setAuthUser(null);
      setIsAuthenticated(false);

      // Clear user-specific data
      setSelectedLanguageState(null);
      setUserProgress([]);
      setUserNameState('Learner');

      // Clear local storage
      await storage.clearAll();

      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
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
        isAuthenticated,
        authUser,
        handleLoginSuccess,
        handleLogout,
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
