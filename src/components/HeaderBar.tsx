import React from 'react';
import { Calendar, Settings, Sparkles, Moon, Sun } from 'lucide-react';
import { Library } from '../types';

interface HeaderBarProps {
  currentProgress: number;
  targetN: number;
  activeLibrary?: Library;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenWordbook: () => void;
  onOpenCalendar: () => void;
  onOpenSettings: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentProgress,
  targetN,
  activeLibrary,
  darkMode,
  onToggleDarkMode,
  onOpenWordbook,
  onOpenCalendar,
  onOpenSettings,
}) => {
  const isGoalReached = currentProgress >= targetN;

  return (
    <header className="w-full max-w-md mx-auto px-4 py-3 flex items-center justify-between select-none">
      {/* Progress & Active Dictionary badge */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenWordbook}
          className="group flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 active:scale-97 transition rounded-full text-xs font-medium text-neutral-700 dark:text-neutral-200"
          title="点击查看单词本"
        >
          <span className="max-w-[110px] truncate">{activeLibrary?.name || '词库'}</span>
          <span className="text-neutral-400 dark:text-neutral-500 font-normal">|</span>
          <span className={`font-semibold ${isGoalReached ? 'text-emerald-700 dark:text-emerald-400' : 'text-neutral-800 dark:text-neutral-100'}`}>
            {currentProgress}/{targetN}
          </span>
          {isGoalReached && <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
        </button>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-1">
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition rounded-full"
            title={darkMode ? '切换浅色模式' : '切换深色模式'}
            aria-label="切换主题"
          >
            {darkMode ? <Sun className="w-5 h-5 stroke-[1.8] text-amber-400" /> : <Moon className="w-5 h-5 stroke-[1.8]" />}
          </button>
        )}

        <button
          onClick={onOpenCalendar}
          className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition rounded-full"
          title="打卡与统计"
        >
          <Calendar className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:scale-95 transition rounded-full"
          title="设置"
        >
          <Settings className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>
    </header>
  );
};
