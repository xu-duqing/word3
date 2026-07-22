import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Word, Library, UserProgress, PracticeCard, DailyRecord } from './types';
import {
  loadUserProgress,
  saveUserProgress,
  loadLibraries,
  saveLibraries,
  loadWordsForLibrary,
  saveWordsForLibrary,
  resetLibraryProgress,
  loadDailyLogs,
  logPracticeSession,
} from './utils/storage';
import { generateDailyPool } from './utils/algorithm';
import { HeaderBar } from './components/HeaderBar';
import { SpellingCard } from './components/SpellingCard';
import { ChoiceCard } from './components/ChoiceCard';
import { DailyCompleteView } from './components/DailyCompleteView';

// Full Screen Page Views
import { OnboardingView } from './views/OnboardingView';
import { StatsCalendarView } from './views/StatsCalendarView';
import { WordbookView } from './views/WordbookView';
import { SettingsView } from './views/SettingsView';

type ViewMode = 'practice' | 'calendar' | 'wordbook' | 'settings';

export default function App() {
  // Global States
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress);
  const [libraries, setLibraries] = useState<Library[]>(loadLibraries);
  const [words, setWords] = useState<Word[]>([]);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyRecord>>(loadDailyLogs);

  // Current Active Page View
  const [currentView, setCurrentView] = useState<ViewMode>('practice');

  // Practice Pool States
  const [queue, setQueue] = useState<PracticeCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState<number>(0);

  // Active Library
  const activeLibrary = useMemo(() => {
    return libraries.find((l) => l.id === progress.activeLibraryId) || libraries[0];
  }, [libraries, progress.activeLibraryId]);

  // Load words when active library changes
  useEffect(() => {
    if (activeLibrary) {
      const loaded = loadWordsForLibrary(activeLibrary.id);
      setWords(loaded);
    }
  }, [activeLibrary]);

  // Function to build fresh daily queue
  const initQueue = useCallback((wordList: Word[], goal: number) => {
    if (wordList.length === 0) return;
    const pool = generateDailyPool(wordList, goal);
    setQueue(pool);
    setCurrentIndex(0);
    setSessionCorrectCount(0);
  }, []);

  // Generate queue on initial load or library load
  useEffect(() => {
    if (words.length > 0 && progress.onboardingCompleted) {
      initQueue(words, progress.dailyGoal);
    }
  }, [words, progress.onboardingCompleted, progress.dailyGoal, initQueue]);

  // Onboarding completion
  const handleOnboardingComplete = (selectedLibId: string, goal: number) => {
    const updatedProgress: UserProgress = {
      ...progress,
      activeLibraryId: selectedLibId,
      dailyGoal: goal,
      onboardingCompleted: true,
    };
    setProgress(updatedProgress);
    saveUserProgress(updatedProgress);

    // Initialize words and queue
    const loadedWords = loadWordsForLibrary(selectedLibId);
    setWords(loadedWords);
    initQueue(loadedWords, goal);
    setCurrentView('practice');
  };

  // Handle word answer state update
  const handleAnswer = (isCorrect: boolean, usedHint = false) => {
    if (currentIndex >= queue.length) return;

    const currentCard = queue[currentIndex];
    const targetWord = currentCard.word;

    // Actual correctness rule: Correct AND no hint used -> streak + 1
    const actualCorrect = isCorrect && !usedHint;

    // 1. Update session stats
    if (actualCorrect) {
      setSessionCorrectCount((prev) => prev + 1);
    }

    // 2. Update word object state
    const updatedWords = words.map((w) => {
      if (w.id === targetWord.id) {
        const newCountPracticed = w.count_practiced + 1;
        let newStreak = actualCorrect ? w.streak_correct + 1 : 0;
        if (newStreak > 3) newStreak = 3;

        const isPassedNow = newStreak >= 3;
        const newErrorCount = actualCorrect ? w.error_count : w.error_count + 1;

        return {
          ...w,
          count_practiced: newCountPracticed,
          streak_correct: newStreak,
          is_passed: isPassedNow,
          error_count: newErrorCount,
          last_practiced_at: Date.now(),
        };
      }
      return w;
    });

    setWords(updatedWords);
    saveWordsForLibrary(activeLibrary.id, updatedWords);

    // 3. Move to next card
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);

    // 4. If session completed
    if (nextIdx >= queue.length) {
      const { updatedStreak } = logPracticeSession(
        queue.length,
        actualCorrect ? sessionCorrectCount + 1 : sessionCorrectCount,
        progress.dailyGoal
      );

      setDailyLogs(loadDailyLogs());
      setProgress((prev) => ({
        ...prev,
        currentStreak: updatedStreak,
      }));
    }
  };

  // Switch active library
  const handleSwitchLibrary = (libraryId: string) => {
    const updatedProgress = { ...progress, activeLibraryId: libraryId };
    setProgress(updatedProgress);
    saveUserProgress(updatedProgress);

    const loaded = loadWordsForLibrary(libraryId);
    setWords(loaded);
    initQueue(loaded, progress.dailyGoal);
  };

  // Reset progress
  const handleResetLibrary = (libraryId: string) => {
    const reset = resetLibraryProgress(libraryId);
    setWords(reset);
    initQueue(reset, progress.dailyGoal);
  };

  // Import custom library
  const handleImportCustomLibrary = (
    name: string,
    parsedWords: { word: string; meaning: string; pos?: string }[]
  ) => {
    const newLibId = `custom_${Date.now()}`;
    const newLib: Library = {
      id: newLibId,
      name,
      description: `自定义导入词库 (${parsedWords.length} 词)`,
      wordCount: parsedWords.length,
      isCustom: true,
      createdAt: Date.now(),
    };

    const updatedLibs = [newLib, ...libraries];
    setLibraries(updatedLibs);
    saveLibraries(updatedLibs);

    // Format words
    const formattedWords: Word[] = parsedWords.map((item, idx) => ({
      id: `${newLibId}_${idx + 1}_${item.word}`,
      word: item.word,
      meaning: item.meaning,
      pos: item.pos,
      count_practiced: 0,
      streak_correct: 0,
      is_passed: false,
      error_count: 0,
    }));

    saveWordsForLibrary(newLibId, formattedWords);

    // Auto set active
    if (!progress.onboardingCompleted) {
      handleOnboardingComplete(newLibId, progress.dailyGoal);
    } else {
      handleSwitchLibrary(newLibId);
      setCurrentView('practice');
    }
  };

  // Update user preferences
  const handleUpdateProgress = (patch: Partial<UserProgress>) => {
    const updated = { ...progress, ...patch };
    setProgress(updated);
    saveUserProgress(updated);
  };

  // Total stats for header & views
  const totalPracticedCount = useMemo(() => {
    return words.reduce((acc, w) => acc + w.count_practiced, 0);
  }, [words]);

  const passedWordsCount = useMemo(() => {
    return words.filter((w) => w.is_passed || w.streak_correct >= 3).length;
  }, [words]);

  const passPercentage = useMemo(() => {
    return words.length > 0 ? (passedWordsCount / words.length) * 100 : 0;
  }, [passedWordsCount, words.length]);

  const isSessionFinished = currentIndex >= queue.length && queue.length > 0;
  const currentCard = queue[currentIndex];

  // Render Onboarding Screen if incomplete
  if (!progress.onboardingCompleted) {
    return (
      <OnboardingView
        libraries={libraries}
        onComplete={handleOnboardingComplete}
        onCustomImportRequest={() => setCurrentView('settings')}
      />
    );
  }

  // Render Full Page View according to currentView
  if (currentView === 'calendar') {
    return (
      <StatsCalendarView
        dailyLogs={dailyLogs}
        currentStreak={progress.currentStreak}
        totalPracticedCount={totalPracticedCount}
        passPercentage={passPercentage}
        activeLibrary={activeLibrary}
        onBack={() => setCurrentView('practice')}
      />
    );
  }

  if (currentView === 'wordbook') {
    return (
      <WordbookView
        words={words}
        activeLibrary={activeLibrary}
        soundEnabled={progress.soundEnabled}
        onBack={() => setCurrentView('practice')}
      />
    );
  }

  if (currentView === 'settings') {
    return (
      <SettingsView
        progress={progress}
        libraries={libraries}
        activeLibrary={activeLibrary}
        onUpdateProgress={handleUpdateProgress}
        onSwitchLibrary={handleSwitchLibrary}
        onResetLibrary={handleResetLibrary}
        onImportCustomLibrary={handleImportCustomLibrary}
        onBack={() => setCurrentView('practice')}
      />
    );
  }

  // Default Full Screen View: Practice Stage
  return (
    <div className="min-h-screen bg-[#f7f6f2] text-neutral-900 font-sans flex flex-col justify-between selection:bg-emerald-200 selection:text-emerald-900 animate-fade-in">
      {/* Top Header Navigation Bar */}
      <HeaderBar
        currentProgress={currentIndex}
        targetN={queue.length || progress.dailyGoal}
        activeLibrary={activeLibrary}
        onOpenWordbook={() => setCurrentView('wordbook')}
        onOpenCalendar={() => setCurrentView('calendar')}
        onOpenSettings={() => setCurrentView('settings')}
      />

      {/* Main Core Practice Card Container */}
      <main className="flex-1 flex items-center justify-center py-4">
        {!isSessionFinished && currentCard ? (
          <div key={`${currentCard.word.id}_${currentIndex}`} className="w-full">
            {currentCard.mode === 'spelling' ? (
              <SpellingCard
                word={currentCard.word}
                soundEnabled={progress.soundEnabled}
                onAnswer={handleAnswer}
              />
            ) : (
              <ChoiceCard
                word={currentCard.word}
                options={currentCard.options || []}
                soundEnabled={progress.soundEnabled}
                onAnswer={handleAnswer}
              />
            )}
          </div>
        ) : (
          <DailyCompleteView
            targetN={progress.dailyGoal}
            sessionCorrectCount={sessionCorrectCount}
            sessionTotalCount={queue.length}
            currentStreak={progress.currentStreak}
            onPracticeAnotherSet={() => initQueue(words, progress.dailyGoal)}
            onOpenCalendar={() => setCurrentView('calendar')}
            onOpenWordbook={() => setCurrentView('wordbook')}
          />
        )}
      </main>

      {/* Bottom Footer */}
      <footer className="text-center py-3 text-[11px] text-neutral-400 select-none">
        背词即生活 · 键盘打字 / 触摸点击均可操作
      </footer>
    </div>
  );
}
