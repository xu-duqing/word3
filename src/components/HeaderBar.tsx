import React from 'react';
import { BookOpen, Calendar, Settings, Sparkles } from 'lucide-react';
import { Library } from '../types';

interface HeaderBarProps {
  currentProgress: number;
  targetN: number;
  activeLibrary?: Library;
  onOpenWordbook: () => void;
  onOpenCalendar: () => void;
  onOpenSettings: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentProgress,
  targetN,
  activeLibrary,
  onOpenWordbook,
  onOpenCalendar,
  onOpenSettings,
}) => {
  const isGoalReached = currentProgress >= targetN;
  const progressPercent = Math.min(100, Math.round((currentProgress / targetN) * 100));

  return (
    <header className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between select-none">
      {/* Progress & Active Dictionary badge */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenWordbook}
          className="group flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200/80 active:scale-97 transition rounded-full text-xs font-medium text-neutral-700"
          title="点击查看单词本"
        >
          <span className="max-w-[110px] truncate">{activeLibrary?.name || '词库'}</span>
          <span className="text-neutral-400 font-normal">|</span>
          <span className={`font-semibold ${isGoalReached ? 'text-emerald-700' : 'text-neutral-800'}`}>
            {currentProgress}/{targetN}
          </span>
          {isGoalReached && <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
        </button>
      </div>

      {/* Progress Bar under header */}
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenWordbook}
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:scale-95 transition rounded-full"
          title="单词本"
        >
          <BookOpen className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          onClick={onOpenCalendar}
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:scale-95 transition rounded-full"
          title="打卡与统计"
        >
          <Calendar className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 active:scale-95 transition rounded-full"
          title="设置"
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>
    </header>
  );
};
