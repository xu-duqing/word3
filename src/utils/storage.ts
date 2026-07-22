import { Library, Word, UserProgress, DailyRecord } from '../types';
import { BUILT_IN_LIBRARIES, getInitialWordsForLibrary } from '../data/builtInLibraries';

const KEYS = {
  LIBRARIES: 'm_vocab_libraries',
  USER_PROGRESS: 'm_vocab_user_progress',
  WORDS_PREFIX: 'm_vocab_words_',
  DAILY_LOGS: 'm_vocab_daily_logs',
};

// Helper for formatted date YYYY-MM-DD
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadUserProgress(): UserProgress {
  const raw = localStorage.getItem(KEYS.USER_PROGRESS);
  if (raw) {
    try {
      const progress: UserProgress = JSON.parse(raw);
      const libs = loadLibraries();
      if (!libs.some((l) => l.id === progress.activeLibraryId)) {
        progress.activeLibraryId = 'core3000';
        saveUserProgress(progress);
      }
      return progress;
    } catch {
      // Fallback
    }
  }
  return {
    activeLibraryId: 'core3000',
    dailyGoal: 20,
    soundEnabled: true,
    autoSpeechEnabled: false,
    onboardingCompleted: false,
    currentStreak: 0,
  };
}

export function saveUserProgress(progress: UserProgress): void {
  localStorage.setItem(KEYS.USER_PROGRESS, JSON.stringify(progress));
}

export function loadLibraries(): Library[] {
  const raw = localStorage.getItem(KEYS.LIBRARIES);
  if (raw) {
    try {
      const parsed: Library[] = JSON.parse(raw);
      if (parsed && parsed.length > 0) {
        // Keep user's custom imported libraries and replace built-ins with the new core3000
        const customLibs = parsed.filter((l) => l.isCustom);
        const merged = [...BUILT_IN_LIBRARIES, ...customLibs];
        saveLibraries(merged);
        return merged;
      }
    } catch {
      // Fallback
    }
  }
  // Initialize default
  saveLibraries(BUILT_IN_LIBRARIES);
  return BUILT_IN_LIBRARIES;
}

export function saveLibraries(libs: Library[]): void {
  localStorage.setItem(KEYS.LIBRARIES, JSON.stringify(libs));
}

export function loadWordsForLibrary(libraryId: string): Word[] {
  const key = `${KEYS.WORDS_PREFIX}${libraryId}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const words: Word[] = JSON.parse(raw);
      if (words && words.length > 0) return words;
    } catch {
      // Fallback
    }
  }

  // Generate initial words from built-in template
  const initial = getInitialWordsForLibrary(libraryId);
  const fullWords: Word[] = initial.map((item, idx) => ({
    id: (item as any).id || `${libraryId}_${idx}`,
    ...item,
    count_practiced: 0,
    streak_correct: 0,
    is_passed: false,
    error_count: 0,
  }));

  saveWordsForLibrary(libraryId, fullWords);
  return fullWords;
}

export function saveWordsForLibrary(libraryId: string, words: Word[]): void {
  const key = `${KEYS.WORDS_PREFIX}${libraryId}`;
  localStorage.setItem(key, JSON.stringify(words));
}

export function resetLibraryProgress(libraryId: string): Word[] {
  const words = loadWordsForLibrary(libraryId);
  const resetWords = words.map((w) => ({
    ...w,
    count_practiced: 0,
    streak_correct: 0,
    is_passed: false,
    error_count: 0,
    last_practiced_at: undefined,
  }));
  saveWordsForLibrary(libraryId, resetWords);
  return resetWords;
}

export function loadDailyLogs(): Record<string, DailyRecord> {
  const raw = localStorage.getItem(KEYS.DAILY_LOGS);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // Fallback
    }
  }
  return {};
}

export function saveDailyLogs(logs: Record<string, DailyRecord>): void {
  localStorage.setItem(KEYS.DAILY_LOGS, JSON.stringify(logs));
}

export function recordSingleAnswer(
  isCorrect: boolean,
  goal: number,
  isSessionCompleted: boolean = false
): { updatedStreak: number } {
  const today = getTodayDateString();
  const logs = loadDailyLogs();
  const progress = loadUserProgress();

  const existingToday = logs[today] || {
    date: today,
    wordsPracticed: 0,
    correctCount: 0,
    totalAttempts: 0,
    goalReached: false,
  };

  const newWordsPracticed = existingToday.wordsPracticed + 1;
  const newCorrect = existingToday.correctCount + (isCorrect ? 1 : 0);
  const newTotalAttempts = existingToday.totalAttempts + 1;
  const wasGoalReached = existingToday.goalReached;

  const isGoalReachedNow =
    wasGoalReached || isSessionCompleted || newWordsPracticed >= goal || newCorrect >= goal;

  logs[today] = {
    date: today,
    wordsPracticed: newWordsPracticed,
    correctCount: newCorrect,
    totalAttempts: newTotalAttempts,
    goalReached: isGoalReachedNow,
  };

  saveDailyLogs(logs);

  // Update consecutive streak
  let streak = progress.currentStreak || 0;
  if (!wasGoalReached && isGoalReachedNow) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (progress.lastPracticeDate === yStr || streak === 0) {
      streak += 1;
    } else if (progress.lastPracticeDate !== today) {
      streak = 1;
    }
    progress.lastPracticeDate = today;
    progress.currentStreak = streak;
    saveUserProgress(progress);
  }

  return { updatedStreak: progress.currentStreak };
}

export function markTodayGoalCompleted(goal: number): { updatedStreak: number } {
  const today = getTodayDateString();
  const logs = loadDailyLogs();
  const progress = loadUserProgress();

  const existingToday = logs[today] || {
    date: today,
    wordsPracticed: 0,
    correctCount: 0,
    totalAttempts: 0,
    goalReached: false,
  };

  const wasGoalReached = existingToday.goalReached;

  logs[today] = {
    ...existingToday,
    goalReached: true,
  };

  saveDailyLogs(logs);

  let streak = progress.currentStreak || 0;
  if (!wasGoalReached) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (progress.lastPracticeDate === yStr || streak === 0) {
      streak += 1;
    } else if (progress.lastPracticeDate !== today) {
      streak = 1;
    }
    progress.lastPracticeDate = today;
    progress.currentStreak = streak;
    saveUserProgress(progress);
  }

  return { updatedStreak: progress.currentStreak };
}

export function logPracticeSession(wordsCount: number, correctCount: number, goal: number): { updatedStreak: number } {
  const today = getTodayDateString();
  const logs = loadDailyLogs();
  const progress = loadUserProgress();

  const existingToday = logs[today] || {
    date: today,
    wordsPracticed: 0,
    correctCount: 0,
    totalAttempts: 0,
    goalReached: false,
  };

  const newWordsPracticed = existingToday.wordsPracticed + wordsCount;
  const newCorrect = existingToday.correctCount + correctCount;
  const newTotalAttempts = existingToday.totalAttempts + wordsCount;
  const wasGoalReached = existingToday.goalReached;
  const isGoalReachedNow = newWordsPracticed >= goal;

  logs[today] = {
    date: today,
    wordsPracticed: newWordsPracticed,
    correctCount: newCorrect,
    totalAttempts: newTotalAttempts,
    goalReached: wasGoalReached || isGoalReachedNow,
  };

  saveDailyLogs(logs);

  // Update consecutive streak
  let streak = progress.currentStreak || 0;
  if (!wasGoalReached && isGoalReachedNow) {
    // Yesterday check
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    if (progress.lastPracticeDate === yStr || streak === 0) {
      streak += 1;
    } else if (progress.lastPracticeDate !== today) {
      streak = 1;
    }
    progress.lastPracticeDate = today;
    progress.currentStreak = streak;
    saveUserProgress(progress);
  }

  return { updatedStreak: progress.currentStreak };
}

// Parse TXT / CSV custom library string
export function parseCustomLibraryText(text: string): { word: string; meaning: string; pos?: string }[] {
  const lines = text.split(/\r?\n/);
  const result: { word: string; meaning: string; pos?: string }[] = [];
  const seenWords = new Set<string>();

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) continue;

    // Try delimiters: tab, comma, equals, colon, slash
    let parts: string[] = [];
    if (line.includes('\t')) {
      parts = line.split('\t');
    } else if (line.includes(',')) {
      parts = line.split(',');
    } else if (line.includes('=')) {
      parts = line.split('=');
    } else if (line.includes(':')) {
      parts = line.split(':');
    } else {
      // Space separated if word and meaning are separated by spaces
      const match = line.match(/^([a-zA-Z\s\-']+)\s+(.+)$/);
      if (match) {
        parts = [match[1], match[2]];
      }
    }

    if (parts.length >= 2) {
      const rawWord = parts[0].trim();
      let rawMeaning = parts.slice(1).join(' ').trim();
      
      if (!rawWord || !rawMeaning) continue;

      const cleanWord = rawWord.toLowerCase();
      if (seenWords.has(cleanWord)) continue;
      seenWords.add(cleanWord);

      // Attempt POS detection from meaning (e.g. "v. 放弃", "adj. 漂亮的")
      let pos: string | undefined;
      const posMatch = rawMeaning.match(/^(v\.|n\.|adj\.|adv\.|prep\.|conj\.|pron\.|num\.|art\.|int\.)\s*(.+)$/i);
      if (posMatch) {
        pos = posMatch[1].toLowerCase();
        rawMeaning = posMatch[2].trim();
      }

      result.push({
        word: rawWord,
        meaning: rawMeaning,
        pos,
      });
    }
  }

  return result;
}
