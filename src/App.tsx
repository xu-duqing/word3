import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  recordSingleAnswer,
  markTodayGoalCompleted,
} from './utils/storage';
import { generateDailyPool } from './utils/algorithm';
import { HeaderBar } from './components/HeaderBar';
import { SpellingCard } from './components/SpellingCard';
import { ChoiceCard } from './components/ChoiceCard';
import { DailyCompleteView } from './components/DailyCompleteView';
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';

// Full Screen Page Views
import { OnboardingView } from './views/OnboardingView';
import { StatsCalendarView } from './views/StatsCalendarView';
import { WordbookView } from './views/WordbookView';
import { SettingsView } from './views/SettingsView';

type ViewMode = 'practice' | 'calendar' | 'wordbook' | 'settings';

const AppShell: React.FC<React.PropsWithChildren> = ({ children }) => (
  <>
    {children}
    <PwaUpdatePrompt />
  </>
);

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

  // Synchronize Dark Mode HTML class & Theme Color Meta Tag
  useEffect(() => {
    const isDark = !!progress.darkMode;
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0a0a0a');
    } else {
      document.documentElement.classList.remove('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f7f6f2');
    }
  }, [progress.darkMode]);

  // Active Library
  const activeLibrary = useMemo(() => {
    return libraries.find((l) => l.id === progress.activeLibraryId) || libraries[0];
  }, [libraries, progress.activeLibraryId]);

  const loadedLibraryIdRef = useRef<string | null>(null);

  // Function to build fresh daily queue
  const initQueue = useCallback((wordList: Word[], goal: number) => {
    if (wordList.length === 0) return;
    const pool = generateDailyPool(wordList, goal);
    setQueue(pool);
    setCurrentIndex(0);
    setSessionCorrectCount(0);
  }, []);

  // Generate queue and load words when active library changes or on initial load
  useEffect(() => {
    if (!progress.onboardingCompleted || !activeLibrary) return;

    if (loadedLibraryIdRef.current !== activeLibrary.id || queue.length === 0) {
      loadedLibraryIdRef.current = activeLibrary.id;
      const loadedWords = loadWordsForLibrary(activeLibrary.id);
      setWords(loadedWords);
      initQueue(loadedWords, progress.dailyGoal);
    }
  }, [activeLibrary, progress.onboardingCompleted, progress.dailyGoal, initQueue, queue.length]);

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

    // A card is considered answered correctly if choice/spelling was correct
    const isAnswerCorrect = isCorrect;

    // 1. Update session stats
    if (isAnswerCorrect) {
      setSessionCorrectCount((prev) => prev + 1);
    }

    // 2. Update word object state
    const updatedWords = words.map((w) => {
      if (w.id === targetWord.id) {
        const newCountPracticed = w.count_practiced + 1;
        let newStreak = isAnswerCorrect ? w.streak_correct + 1 : 0;
        if (newStreak > 3) newStreak = 3;

        const isPassedNow = newStreak >= 3;
        const newErrorCount = isAnswerCorrect ? w.error_count : w.error_count + 1;

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

    // 3. Queue update: If answered incorrectly, re-insert card so user must answer it correctly once today
    let nextQueue = queue;
    if (!isAnswerCorrect) {
      nextQueue = [...queue, currentCard];
      setQueue(nextQueue);
    }

    // 4. Move to next card
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);

    const isSessionCompleted = nextIdx >= nextQueue.length;

    // 5. Record in daily logs on EVERY answer attempt
    const { updatedStreak } = recordSingleAnswer(isAnswerCorrect, progress.dailyGoal, isSessionCompleted);
    const newLogs = loadDailyLogs();
    setDailyLogs(newLogs);

    if (updatedStreak !== progress.currentStreak) {
      const updatedProgress = { ...progress, currentStreak: updatedStreak };
      setProgress(updatedProgress);
      saveUserProgress(updatedProgress);
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

  // Unique word IDs in today's daily pool
  const todayWordIds = useMemo(() => {
    return new Set(queue.map((card) => card.word.id));
  }, [queue]);

  const isSessionFinished = currentIndex >= queue.length && queue.length > 0;
  const currentCard = queue[currentIndex];

  // Render Onboarding Screen if incomplete
  if (!progress.onboardingCompleted) {
    return (
      <>
        <OnboardingView
          libraries={libraries}
          onComplete={handleOnboardingComplete}
          onCustomImportRequest={() => setCurrentView('settings')}
        />
        <PwaUpdatePrompt />
      </>
    );
  }

  // Render Full Page View according to currentView
  if (currentView === 'calendar') {
    return (
      <AppShell>
        <StatsCalendarView
          dailyLogs={dailyLogs}
          currentStreak={progress.currentStreak}
          totalPracticedCount={totalPracticedCount}
          passPercentage={passPercentage}
          activeLibrary={activeLibrary}
          onBack={() => setCurrentView('practice')}
        />
      </AppShell>
    );
  }

  if (currentView === 'wordbook') {
    return (
      <AppShell>
        <WordbookView
          words={words}
          activeLibrary={activeLibrary}
          soundEnabled={progress.soundEnabled}
          todayWordIds={todayWordIds}
          onBack={() => setCurrentView('practice')}
        />
      </AppShell>
    );
  }

  if (currentView === 'settings') {
    return (
      <AppShell>
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
      </AppShell>
    );
  }

  // Default Full Screen View: Practice Stage
  return (
    <AppShell>
      <div className="min-h-screen bg-[#f7f6f2] dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans flex flex-col justify-between selection:bg-emerald-200 selection:text-emerald-900 animate-fade-in">
        {/* Top Header Navigation Bar */}
        <HeaderBar
          currentProgress={sessionCorrectCount}
          targetN={progress.dailyGoal}
          activeLibrary={activeLibrary}
          darkMode={progress.darkMode}
          onToggleDarkMode={() => handleUpdateProgress({ darkMode: !progress.darkMode })}
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
        <footer className="text-center py-2 text-[11px] text-neutral-400 select-none" />
      </div>
    </AppShell>
  );
}
