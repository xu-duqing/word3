import React, { useState } from 'react';
import { ArrowLeft, Search, Volume2 } from 'lucide-react';
import { Word, Library } from '../types';
import { speakEnglishWord } from '../utils/sound';

interface WordbookViewProps {
  words: Word[];
  activeLibrary?: Library;
  soundEnabled: boolean;
  onBack: () => void;
}

export const WordbookView: React.FC<WordbookViewProps> = ({
  words,
  activeLibrary,
  soundEnabled,
  onBack,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'learning' | 'passed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalWordsCount = words.length;
  const passedWordsCount = words.filter((w) => w.is_passed || w.streak_correct >= 3).length;
  const passPercentage = totalWordsCount > 0 ? (passedWordsCount / totalWordsCount) * 100 : 0;

  // Filter words
  const filteredWords = words.filter((w) => {
    // Tab filter
    if (filterTab === 'learning' && (w.is_passed || w.streak_correct >= 3)) return false;
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

  const renderStreakDots = (streak: number) => {
    const dots = [0, 1, 2];
    return (
      <div className="flex items-center gap-1" title={`连续正确 ${streak}/3 次`}>
        {dots.map((idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full transition-all ${
              idx < streak ? 'bg-emerald-500 scale-110' : 'bg-neutral-200 dark:bg-neutral-700'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] dark:bg-neutral-950 flex flex-col p-4 sm:p-6 select-none animate-fade-in transition-colors duration-200">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col space-y-4">
        {/* Navigation Header */}
        <div className="flex items-center justify-between py-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-full border border-neutral-200/80 dark:border-neutral-700 text-xs font-semibold shadow-2xs transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </button>
          <h1 className="text-base font-bold text-neutral-900 dark:text-neutral-100">单词本</h1>
          <div className="w-12" />
        </div>

        {/* Banner Progress Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 font-mono tracking-tight">
              {Math.round(passPercentage)}%
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
              {activeLibrary?.name || '当前词库'} · 共 {totalWordsCount} 词
            </span>
          </div>

          {/* Progress bar line */}
          <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#183b2b] dark:bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, passPercentage)}%` }}
            />
          </div>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 pt-0.5">
            已通过 <span className="font-semibold text-neutral-800 dark:text-neutral-200">{passedWordsCount}</span> / {totalWordsCount} 个单词
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-200/60 dark:bg-neutral-800/80 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setFilterTab('all')}
            className={`flex-1 py-2 rounded-xl text-center transition ${
              filterTab === 'all'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterTab('learning')}
            className={`flex-1 py-2 rounded-xl text-center transition ${
              filterTab === 'learning'
                ? 'bg-[#183b2b] dark:bg-emerald-600 text-white shadow-2xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            学习中
          </button>
          <button
            onClick={() => setFilterTab('passed')}
            className={`flex-1 py-2 rounded-xl text-center transition ${
              filterTab === 'passed'
                ? 'bg-emerald-600 dark:bg-emerald-500 text-white shadow-2xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            已通过
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400 dark:text-neutral-500" />
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
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-xs focus:outline-hidden focus:border-neutral-400 dark:focus:border-neutral-600 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 shadow-2xs"
          />
        </div>

        {/* Word List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[500px]">
          {filteredWords.length > 0 ? (
            filteredWords.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition flex items-center justify-between group shadow-2xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm sm:text-base">{item.word}</span>
                    {item.pos && (
                      <span className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded-md font-semibold">
                        {item.pos}
                      </span>
                    )}
                    <button
                      onClick={() => speakEnglishWord(item.word, soundEnabled)}
                      className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition p-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">{item.meaning}</p>
                </div>

                <div className="text-right space-y-1 shrink-0 ml-3">
                  {renderStreakDots(item.streak_correct)}
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    {item.count_practiced > 0 ? `已练 ${item.count_practiced} 次` : '未开始'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-xs text-neutral-400 dark:text-neutral-500 space-y-1">
              <p>暂无符合条件的单词</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
