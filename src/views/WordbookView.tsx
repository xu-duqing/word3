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
              idx < streak ? 'bg-emerald-500 scale-110' : 'bg-neutral-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex flex-col p-4 sm:p-6 select-none animate-fade-in">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col space-y-4">
        {/* Navigation Header */}
        <div className="flex items-center justify-between py-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-800 rounded-full border border-neutral-200/80 text-xs font-semibold shadow-2xs transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </button>
          <h1 className="text-base font-bold text-neutral-900">单词本</h1>
          <div className="w-12" />
        </div>

        {/* Banner Progress Card */}
        <div className="bg-white rounded-3xl p-5 border border-neutral-200/80 shadow-2xs space-y-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
              {Math.round(passPercentage)}%
            </span>
            <span className="text-xs text-neutral-400 font-medium">
              {activeLibrary?.name || '当前词库'} · 共 {totalWordsCount} 词
            </span>
          </div>

          {/* Progress bar line */}
          <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#183b2b] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, passPercentage)}%` }}
            />
          </div>

          <p className="text-xs text-neutral-500 pt-0.5">
            已通过 <span className="font-semibold text-neutral-800">{passedWordsCount}</span> / {totalWordsCount} 个单词
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-200/60 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setFilterTab('all')}
            className={`flex-1 py-2 rounded-xl text-center transition ${
              filterTab === 'all'
                ? 'bg-white text-neutral-900 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterTab('learning')}
            className={`flex-1 py-2 rounded-xl text-center transition ${
              filterTab === 'learning'
                ? 'bg-[#183b2b] text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            学习中
          </button>
          <button
            onClick={() => setFilterTab('passed')}
            className={`flex-1 py-2 rounded-xl text-center transition ${
              filterTab === 'passed'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            已通过
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
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
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-neutral-200 text-xs focus:outline-hidden focus:border-neutral-400 text-neutral-800 placeholder-neutral-400 shadow-2xs"
          />
        </div>

        {/* Word List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[500px]">
          {filteredWords.length > 0 ? (
            filteredWords.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white rounded-2xl border border-neutral-200/70 hover:border-neutral-300 transition flex items-center justify-between group shadow-2xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 text-sm sm:text-base">{item.word}</span>
                    {item.pos && (
                      <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded-md font-semibold">
                        {item.pos}
                      </span>
                    )}
                    <button
                      onClick={() => speakEnglishWord(item.word, soundEnabled)}
                      className="text-neutral-400 hover:text-neutral-800 transition p-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-1">{item.meaning}</p>
                </div>

                <div className="text-right space-y-1 shrink-0 ml-3">
                  {renderStreakDots(item.streak_correct)}
                  <p className="text-[10px] text-neutral-400">
                    {item.count_practiced > 0 ? `已练 ${item.count_practiced} 次` : '未开始'}
                  </p>
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
