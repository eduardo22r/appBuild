export interface Language {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  translation: string;
  pronunciation?: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  example?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  languageId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  vocabulary: Vocabulary[];
  completed: boolean;
}

export interface UserProgress {
  languageId: string;
  completedLessons: string[];
  masteredWords: string[];
  score: number;
  streak: number;
  lastStudied?: Date;
}

export interface QuizQuestion {
  id: string;
  word: string;
  correctAnswer: string;
  options: string[];
  type: 'translation' | 'multipleChoice';
}
