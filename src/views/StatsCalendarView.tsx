import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Flame, BookOpen, Target } from 'lucide-react';
import { DailyRecord, Library } from '../types';

interface StatsCalendarViewProps {
  dailyLogs: Record<string, DailyRecord>;
  currentStreak: number;
  totalPracticedCount: number;
  passPercentage: number;
  activeLibrary?: Library;
  onBack: () => void;
}

export const StatsCalendarView: React.FC<StatsCalendarViewProps> = ({
  dailyLogs,
  currentStreak,
  totalPracticedCount,
  passPercentage,
  activeLibrary,
  onBack,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayDetail, setSelectedDayDetail] = useState<DailyRecord | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayDetail(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayDetail(null);
  };

  const weekLabels = ['日', '一', '二', '三', '四', '五', '六'];

  const handleDayClick = (dayNum: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const log = dailyLogs[dayStr];
    if (log) {
      setSelectedDayDetail(log);
    } else {
      setSelectedDayDetail({
        date: dayStr,
        wordsPracticed: 0,
        correctCount: 0,
        totalAttempts: 0,
        goalReached: false,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] dark:bg-neutral-950 flex flex-col p-4 sm:p-6 select-none animate-fade-in">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col space-y-4">
        {/* Header Navigation */}
        <div className="flex items-center justify-between py-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-full border border-neutral-200/80 dark:border-neutral-700 text-xs font-semibold shadow-2xs transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </button>
          <h1 className="text-base font-bold text-neutral-900 dark:text-neutral-100">打卡与统计</h1>
          <div className="w-12" />
        </div>

        {/* Top 3 Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-neutral-900 p-4.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 font-semibold mb-1">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>连续打卡</span>
            </div>
            <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100 font-mono">
              {currentStreak} <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">天</span>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-4.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold mb-1">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>累计练习</span>
            </div>
            <div className="text-2xl font-black text-neutral-900 dark:text-neutral-100 font-mono">
              {totalPracticedCount.toLocaleString()} <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">词</span>
            </div>
          </div>

          <div className="col-span-2 bg-white dark:bg-neutral-900 p-4.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 font-semibold mb-0.5">
                <Target className="w-4 h-4 text-[#183b2b] dark:text-emerald-400" />
                <span>当前词库通关进度</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{activeLibrary?.name || '默认词库'}</p>
            </div>
            <div className="text-2xl font-black text-[#183b2b] dark:text-emerald-400 font-mono">
              {passPercentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
          {/* Month Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-neutral-600 dark:text-neutral-400 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="font-bold text-neutral-900 dark:text-neutral-100 text-base">
              {year}年 {monthNames[month]}
            </span>

            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl text-neutral-600 dark:text-neutral-400 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Status Legend */}
          <div className="flex items-center justify-center gap-5 text-xs font-medium text-neutral-600 dark:text-neutral-400 pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600" />
              <span>未打卡</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>打卡中</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>打卡完成</span>
            </div>
          </div>

          {/* Week Label Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-neutral-400 dark:text-neutral-500">
            {weekLabels.map((lbl, idx) => (
              <div key={idx} className="py-1">
                {lbl}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {/* Empty offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-10" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const record = dailyLogs[dateStr];
              const isGoalReached = record?.goalReached;
              const hasPracticed = record && record.wordsPracticed > 0;

              let bgClasses = 'bg-neutral-100/70 dark:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800';
              let dotClass = 'bg-neutral-300 dark:bg-neutral-600';

              if (isGoalReached) {
                bgClasses = 'bg-[#183b2b] dark:bg-emerald-600 text-white font-bold shadow-2xs';
                dotClass = 'bg-emerald-400';
              } else if (hasPracticed) {
                bgClasses = 'bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700/60 font-bold';
                dotClass = 'bg-amber-500';
              }

              return (
                <button
                  key={dayNum}
                  onClick={() => handleDayClick(dayNum)}
                  className={`h-10 rounded-2xl flex flex-col items-center justify-center text-xs transition active:scale-90 relative gap-0.5 ${bgClasses}`}
                >
                  <span className="leading-none">{dayNum}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Summary */}
        {selectedDayDetail && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200/80 dark:border-neutral-800 shadow-2xs text-xs space-y-2 animate-fade-in">
            <div className="flex items-center justify-between font-bold text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-2">
              <span>{selectedDayDetail.date} 练习记录</span>
              {selectedDayDetail.goalReached ? (
                <span className="text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  打卡完成
                </span>
              ) : selectedDayDetail.wordsPracticed > 0 ? (
                <span className="text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  打卡中
                </span>
              ) : (
                <span className="text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                  未打卡
                </span>
              )}
            </div>

            {selectedDayDetail.wordsPracticed > 0 ? (
              <div className="grid grid-cols-2 gap-2 pt-1 text-neutral-600 dark:text-neutral-400">
                <div>已背单词：<span className="font-bold text-neutral-900 dark:text-neutral-100">{selectedDayDetail.wordsPracticed} 个</span></div>
                <div>正确率：
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">
                    {selectedDayDetail.totalAttempts > 0
                      ? Math.round((selectedDayDetail.correctCount / selectedDayDetail.totalAttempts) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-neutral-400 dark:text-neutral-500 py-1">该日暂无练习记录</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
