import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle2, Flame, BookOpen, Target } from 'lucide-react';
import { DailyRecord, Library } from '../types';

interface StatsCalendarModalProps {
  dailyLogs: Record<string, DailyRecord>;
  currentStreak: number;
  totalPracticedCount: number;
  passPercentage: number;
  activeLibrary?: Library;
  onClose: () => void;
}

export const StatsCalendarModal: React.FC<StatsCalendarModalProps> = ({
  dailyLogs,
  currentStreak,
  totalPracticedCount,
  passPercentage,
  activeLibrary,
  onClose,
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
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#faf9f6] rounded-[32px] p-6 shadow-2xl border border-neutral-200/90 flex flex-col max-h-[92vh] overflow-y-auto select-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-200/60 rounded-full transition text-neutral-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-neutral-900">打卡与统计</h2>
          <div className="w-8" />
        </div>

        {/* Top 3 Stat Cards (Matching PAGE 4 layout) */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold mb-1">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>连续打卡</span>
            </div>
            <div className="text-2xl font-black text-neutral-900 font-mono">
              {currentStreak} <span className="text-xs font-normal text-neutral-500">天</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mb-1">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>累计练习</span>
            </div>
            <div className="text-2xl font-black text-neutral-900 font-mono">
              {totalPracticedCount.toLocaleString()} <span className="text-xs font-normal text-neutral-500">词</span>
            </div>
          </div>

          <div className="col-span-2 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-700 font-semibold mb-0.5">
                <Target className="w-4 h-4 text-[#183b2b]" />
                <span>当前词库通关进度</span>
              </div>
              <p className="text-[11px] text-neutral-500">{activeLibrary?.name || '默认词库'}</p>
            </div>
            <div className="text-xl font-black text-[#183b2b] font-mono">
              {passPercentage.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Calendar Card */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-2xs space-y-4">
          {/* Month Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-600 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="font-bold text-neutral-900 text-sm">
              {year}年 {monthNames[month]}
            </span>

            <button
              onClick={nextMonth}
              className="p-1 hover:bg-neutral-100 rounded-lg text-neutral-600 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Week Label Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-neutral-400">
            {weekLabels.map((lbl, idx) => (
              <div key={idx} className="py-1">
                {lbl}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-8" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const record = dailyLogs[dateStr];
              const isGoalReached = record?.goalReached;
              const hasPracticed = record && record.wordsPracticed > 0;

              return (
                <button
                  key={dayNum}
                  onClick={() => handleDayClick(dayNum)}
                  className={`h-8 rounded-full flex items-center justify-center text-xs font-semibold transition active:scale-90 relative ${
                    isGoalReached
                      ? 'bg-[#183b2b] text-white shadow-2xs font-bold'
                      : hasPracticed
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {dayNum}
                  {isGoalReached && (
                    <span className="absolute -bottom-0.5 w-1 h-1 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Summary Footer Modal */}
        {selectedDayDetail && (
          <div className="mt-4 bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-2xs text-xs space-y-2 animate-fade-in">
            <div className="flex items-center justify-between font-bold text-neutral-900 border-b border-neutral-100 pb-2">
              <span>{selectedDayDetail.date} 练习记录</span>
              {selectedDayDetail.goalReached && (
                <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  打卡成功
                </span>
              )}
            </div>

            {selectedDayDetail.wordsPracticed > 0 ? (
              <div className="grid grid-cols-2 gap-2 pt-1 text-neutral-600">
                <div>已背单词：<span className="font-bold text-neutral-900">{selectedDayDetail.wordsPracticed} 个</span></div>
                <div>正确率：
                  <span className="font-bold text-neutral-900">
                    {selectedDayDetail.totalAttempts > 0
                      ? Math.round((selectedDayDetail.correctCount / selectedDayDetail.totalAttempts) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-neutral-400 py-1">该日暂无练习记录</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
