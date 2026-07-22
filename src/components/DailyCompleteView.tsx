import React from 'react';
import { Sparkles, Calendar, BookOpen, RefreshCw, Trophy, Flame } from 'lucide-react';

interface DailyCompleteViewProps {
  targetN: number;
  sessionCorrectCount: number;
  sessionTotalCount: number;
  currentStreak: number;
  onPracticeAnotherSet: () => void;
  onOpenCalendar: () => void;
  onOpenWordbook: () => void;
}

export const DailyCompleteView: React.FC<DailyCompleteViewProps> = ({
  targetN,
  sessionCorrectCount,
  sessionTotalCount,
  currentStreak,
  onPracticeAnotherSet,
  onOpenCalendar,
  onOpenWordbook,
}) => {
  const accuracy = sessionTotalCount > 0 ? Math.round((sessionCorrectCount / sessionTotalCount) * 100) : 100;

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 select-none flex flex-col items-center justify-center text-center animate-fade-in">
      <div className="w-full bg-white rounded-[32px] p-8 shadow-xs border border-neutral-200/90 space-y-6">
        {/* Celebration Trophy / Badge */}
        <div className="relative mx-auto w-20 h-20 bg-emerald-100/80 rounded-full flex items-center justify-center text-emerald-800 shadow-inner">
          <Trophy className="w-10 h-10 text-[#183b2b]" />
          <div className="absolute -top-1 -right-1 p-1 bg-amber-400 rounded-full text-white shadow-xs">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            今日背词目标达成！
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            坚持不懈，积少成多
          </p>
        </div>

        {/* Performance Grid */}
        <div className="grid grid-cols-2 gap-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/60">
          <div className="text-center">
            <p className="text-[11px] text-neutral-400 font-medium">本次练习数量</p>
            <p className="text-xl font-bold text-neutral-900 font-mono mt-0.5">
              {sessionTotalCount} <span className="text-xs font-normal">词</span>
            </p>
          </div>

          <div className="text-center">
            <p className="text-[11px] text-neutral-400 font-medium">本次拼写/选择正确率</p>
            <p className="text-xl font-bold text-emerald-800 font-mono mt-0.5">
              {accuracy}%
            </p>
          </div>

          <div className="col-span-2 pt-2 border-t border-neutral-200/60 flex items-center justify-center gap-2 text-xs font-semibold text-amber-800">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>连续打卡 {currentStreak} 天</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={onPracticeAnotherSet}
            className="w-full py-3.5 bg-[#183b2b] hover:bg-[#122e22] text-white font-semibold rounded-2xl shadow-sm text-sm flex items-center justify-center gap-2 transition active:scale-98"
          >
            <RefreshCw className="w-4 h-4" />
            <span>再背一组 ({targetN} 词)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenCalendar}
              className="py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <Calendar className="w-4 h-4 text-neutral-600" />
              <span>查看打卡日历</span>
            </button>

            <button
              onClick={onOpenWordbook}
              className="py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <BookOpen className="w-4 h-4 text-neutral-600" />
              <span>查看单词本</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
