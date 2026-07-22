import React, { useState } from 'react';
import { ArrowLeft, Search, Volume2 } from 'lucide-react';
import { Word, Library } from '../types';
import { speakEnglishWord } from '../utils/sound';

interface WordbookModalProps {
  words: Word[];
  activeLibrary?: Library;
  soundEnabled: boolean;
  todayWordIds?: Set<string>;
  onClose: () => void;
}

export const WordbookModal: React.FC<WordbookModalProps> = ({
  words,
  activeLibrary,
  soundEnabled,
  todayWordIds,
  onClose,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'learning' | 'passed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalWordsCount = words.length;
  const passedWordsCount = words.filter((w) => w.is_passed || w.streak_correct >= 3).length;
  const passPercentage = totalWordsCount > 0 ? (passedWordsCount / totalWordsCount) * 100 : 0;

  // Filter words
  const filteredWords = words.filter((w) => {
    // Tab filter
    if (filterTab === 'learning') {
      if (todayWordIds && todayWordIds.size > 0) {
        if (!todayWordIds.has(w.id)) return false;
      } else if (w.is_passed || w.streak_correct >= 3) {
        return false;
      }
    }
    if (filterTab === 'passed' && !w.is_passed && w.streak_correct < 3) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        w.word.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        (w.pos && w.pos.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const isPracticedToday = (lastPracticedAt?: number) => {
    if (!lastPracticedAt) return false;
    const d = new Date(lastPracticedAt);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const renderWordStatusBadge = (item: Word) => {
    const isFullyPassed = item.is_passed || item.streak_correct >= 3;
    const isTodayPassed = !isFullyPassed && item.last_practiced_at && isPracticedToday(item.last_practiced_at) && item.streak_correct > 0;

    if (isFullyPassed) {
      return (
        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
          完全通过
        </span>
      );
    }
    if (isTodayPassed) {
      return (
        <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
          今日已过关
        </span>
      );
    }
    if (item.count_practiced > 0) {
      return (
        <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
          学习中
        </span>
      );
    }
    return (
      <span className="text-[10px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
        未开始
      </span>
    );
  };

  const renderStreakDots = (streak: number) => {
    const dots = [0, 1, 2];
    return (
      <div className="flex items-center gap-1" title={`连续正确 ${streak}/3 次`}>
        {dots.map((idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full transition-all ${
              idx < streak ? 'bg-emerald-500 scale-110' : 'bg-neutral-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#faf9f6] rounded-[32px] p-5 shadow-2xl border border-neutral-200/90 flex flex-col h-[90vh] select-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-200/60 rounded-full transition text-neutral-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-neutral-900">单词本</h2>
          <div className="w-8" />
        </div>

        {/* Banner Card (Matching PAGE 8 & PAGE 9 layout) */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-2xs mb-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
              {Math.round(passPercentage)}%
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              {activeLibrary?.name || '当前词库'} · 共 {totalWordsCount} 词
            </span>
          </div>

          {/* Progress bar line */}
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#183b2b] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, passPercentage)}%` }}
            />
          </div>

          <p className="text-[11px] text-neutral-500 pt-0.5">
            已通过 <span className="font-semibold text-neutral-800">{passedWordsCount}</span> / {totalWordsCount} 个单词
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-200/60 rounded-xl mb-3 text-xs font-semibold">
          <button
            onClick={() => setFilterTab('all')}
            className={`flex-1 py-1.5 rounded-lg text-center transition ${
              filterTab === 'all'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterTab('learning')}
            className={`flex-1 py-1.5 rounded-lg text-center transition ${
              filterTab === 'learning'
                ? 'bg-[#183b2b] text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            学习中
          </button>
          <button
            onClick={() => setFilterTab('passed')}
            className={`flex-1 py-1.5 rounded-lg text-center transition ${
              filterTab === 'passed'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            已通过
          </button>
        </div>

        {/* Search input */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={(e) => {
              setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 200);
            }}
            enterKeyHint="search"
            placeholder="搜索单词或中文释义..."
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-neutral-200 text-xs focus:outline-hidden focus:border-neutral-400 text-neutral-800 placeholder-neutral-400"
          />
        </div>

        {/* Word List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredWords.length > 0 ? (
            filteredWords.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-white rounded-2xl border border-neutral-200/70 hover:border-neutral-300 transition flex items-center justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 text-sm">{item.word}</span>
                    {item.pos && (
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded-md font-medium">
                        {item.pos}
                      </span>
                    )}
                    <button
                      onClick={() => speakEnglishWord(item.word, soundEnabled)}
                      className="text-neutral-400 hover:text-neutral-800 transition p-0.5"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-1">{item.meaning}</p>
                </div>

                <div className="text-right space-y-1.5 shrink-0 ml-3 flex flex-col items-end">
                  {renderWordStatusBadge(item)}
                  <div className="flex items-center gap-1.5">
                    {renderStreakDots(item.streak_correct)}
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {item.count_practiced > 0 ? `${item.count_practiced}次` : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-xs text-neutral-400 space-y-1">
              <p>暂无符合条件的单词</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
