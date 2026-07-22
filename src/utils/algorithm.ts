import { Word, PracticeCard, QuestionMode } from '../types';

/**
 * Daily Pool Logic
 * Generates a practice queue of size N based on the PRD specification:
 * - 80% Unmastered words (streak_correct < 3), prioritized by least count_practiced or highest error_count.
 * - 20% Mastered words (streak_correct >= 3), prioritized by oldest last_practiced_at.
 * - Dynamic backfill: If unmastered words < 80% * N, backfill with mastered words so total = N.
 */
export function generateDailyPool(allWords: Word[], targetN: number): PracticeCard[] {
  if (allWords.length === 0) return [];

  const unmastered = allWords.filter((w) => !w.is_passed && w.streak_correct < 3);
  const mastered = allWords.filter((w) => w.is_passed || w.streak_correct >= 3);

  const targetUnmasteredCount = Math.min(Math.round(targetN * 0.8), unmastered.length);
  const targetMasteredCount = Math.min(targetN - targetUnmasteredCount, mastered.length);

  // 1. Sort Unmastered: least count_practiced first, then highest error_count
  const sortedUnmastered = [...unmastered].sort((a, b) => {
    if (a.count_practiced !== b.count_practiced) {
      return a.count_practiced - b.count_practiced;
    }
    return b.error_count - a.error_count;
  });

  // 2. Sort Mastered: longest time since last practice (undefined or smallest timestamp)
  const sortedMastered = [...mastered].sort((a, b) => {
    const aTime = a.last_practiced_at || 0;
    const bTime = b.last_practiced_at || 0;
    return aTime - bTime;
  });

  // Select initial pools
  let selectedUnmastered = sortedUnmastered.slice(0, targetUnmasteredCount);
  let selectedMastered = sortedMastered.slice(0, targetMasteredCount);

  // 3. Dynamic Backfill if total < targetN
  let selectedPool = [...selectedUnmastered, ...selectedMastered];
  const remainingNeeded = Math.min(targetN, allWords.length) - selectedPool.length;

  if (remainingNeeded > 0) {
    const selectedIds = new Set(selectedPool.map((w) => w.id));
    const unselectedWords = allWords.filter((w) => !selectedIds.has(w.id));

    // Sort remaining by priority (unmastered first, then oldest practiced)
    unselectedWords.sort((a, b) => {
      if (a.streak_correct !== b.streak_correct) {
        return a.streak_correct - b.streak_correct;
      }
      return (a.last_practiced_at || 0) - (b.last_practiced_at || 0);
    });

    selectedPool = [...selectedPool, ...unselectedWords.slice(0, remainingNeeded)];
  }

  // Shuffle selectedPool for natural flow
  const shuffledWords = shuffleArray(selectedPool);

  // Convert to PracticeCard items with randomized mode & options
  return shuffledWords.map((word) => {
    // 50% Spelling, 50% Choice
    const mode: QuestionMode = Math.random() < 0.5 ? 'spelling' : 'choice';
    let options: string[] | undefined;

    if (mode === 'choice') {
      options = generateChoiceOptions(word, allWords);
    }

    return {
      word,
      mode,
      options,
    };
  });
}

/**
 * Generate 4 options for multiple choice: 1 correct meaning + 3 random distractors
 */
export function generateChoiceOptions(correctWord: Word, allWords: Word[]): string[] {
  const correctMeaning = formatFullMeaning(correctWord);
  
  // Collect other meanings
  const distractors: string[] = [];
  const otherWords = allWords.filter((w) => w.id !== correctWord.id);
  const shuffledOthers = shuffleArray(otherWords);

  for (const other of shuffledOthers) {
    const formatted = formatFullMeaning(other);
    if (formatted !== correctMeaning && !distractors.includes(formatted)) {
      distractors.push(formatted);
    }
    if (distractors.length >= 3) break;
  }

  // Fallback distractors if library is small
  const fallbackMeanings = ['放弃，抛弃', '巨大的，庞大的', '明显的，显而易见的', '维持，保持', '促进，加速', '独特的，特有的'];
  let fbIdx = 0;
  while (distractors.length < 3) {
    const fb = fallbackMeanings[fbIdx % fallbackMeanings.length];
    if (fb !== correctMeaning && !distractors.includes(fb)) {
      distractors.push(fb);
    }
    fbIdx++;
  }

  const allOptions = [correctMeaning, ...distractors.slice(0, 3)];
  return shuffleArray(allOptions);
}

export function formatFullMeaning(word: Word): string {
  if (word.pos) {
    return `${word.pos} ${word.meaning}`;
  }
  return word.meaning;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
