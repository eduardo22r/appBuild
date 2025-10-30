import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, UserProgress } from '../types';
import { storage } from '../utils/storage';
import { LANGUAGES } from '../data/languages';

interface AppContextType {
  selectedLanguage: Language | null;
  setSelectedLanguage: (language: Language) => void;
  userProgress: UserProgress[];
  updateProgress: (languageId: string, lessonId: string, wordIds: string[]) => void;
  userName: string;
  setUserName: (name: string) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguageState] = useState<Language | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [userName, setUserNameState] = useState<string>('Learner');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
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
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
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
