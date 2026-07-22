export interface Word {
  id: string;
  word: string;
  meaning: string;
  pos?: string; // Part of speech, e.g. "v.", "n.", "adj."
  phonetic?: string; // Phonetic transcription, e.g. "/ə'bændən/"
  example?: string;
  count_practiced: number;
  streak_correct: number; // 0, 1, 2, 3
  is_passed: boolean; // true when streak_correct >= 3
  last_practiced_at?: number; // timestamp
  error_count: number;
}

export interface Library {
  id: string;
  name: string;
  description: string;
  wordCount: number;
  isCustom?: boolean;
  createdAt?: number;
}

export interface UserProgress {
  activeLibraryId: string;
  dailyGoal: number; // N
  soundEnabled: boolean;
  autoSpeechEnabled: boolean;
  onboardingCompleted: boolean;
  currentStreak: number;
  lastPracticeDate?: string; // YYYY-MM-DD
  darkMode?: boolean;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  wordsPracticed: number;
  correctCount: number;
  totalAttempts: number;
  goalReached: boolean;
}

export type QuestionMode = 'spelling' | 'choice';

export interface PracticeCard {
  word: Word;
  mode: QuestionMode;
  options?: string[]; // 4 Chinese meanings for choice mode
}
