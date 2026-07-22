import React from 'react';
import { Delete, CornerDownLeft, Lightbulb } from 'lucide-react';

interface VirtualKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onHint: () => void;
  disabled?: boolean;
  usedHint?: boolean;
  activeKey?: string | null;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onEnter,
  onHint,
  disabled = false,
  usedHint = false,
  activeKey = null,
}) => {
  const row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  const row3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm', '-'];

  const isKeyActive = (keyStr: string) => {
    return activeKey?.toLowerCase() === keyStr.toLowerCase();
  };

  const handleTouch = (e: React.MouseEvent | React.TouchEvent, action: () => void) => {
    e.preventDefault(); // Prevent native browser zoom / double tap delay
    if (disabled) return;
    action();
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4 p-2 bg-neutral-100/90 dark:bg-neutral-900/90 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-xs select-none touch-manipulation transition-colors">
      {/* Row 1 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 mb-1.5">
        {row1.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled}
            onClick={(e) => handleTouch(e, () => onKeyPress(char))}
            className={`flex-1 min-w-[28px] max-w-[38px] h-11 sm:h-12 bg-white dark:bg-neutral-800 rounded-lg text-base sm:text-lg font-semibold text-neutral-800 dark:text-neutral-100 shadow-2xs border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-center transition-all duration-75 active:scale-95 active:bg-neutral-200 dark:active:bg-neutral-700 ${
              isKeyActive(char) ? 'bg-emerald-200 dark:bg-emerald-800/80 border-emerald-400 dark:border-emerald-500 scale-95' : ''
            } ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'}`}
          >
            {char.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 mb-1.5 px-2">
        {row2.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled}
            onClick={(e) => handleTouch(e, () => onKeyPress(char))}
            className={`flex-1 min-w-[28px] max-w-[38px] h-11 sm:h-12 bg-white dark:bg-neutral-800 rounded-lg text-base sm:text-lg font-semibold text-neutral-800 dark:text-neutral-100 shadow-2xs border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-center transition-all duration-75 active:scale-95 active:bg-neutral-200 dark:active:bg-neutral-700 ${
              isKeyActive(char) ? 'bg-emerald-200 dark:bg-emerald-800/80 border-emerald-400 dark:border-emerald-500 scale-95' : ''
            } ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'}`}
          >
            {char.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Row 3 */}
      <div className="flex justify-center gap-1 sm:gap-1.5 mb-1.5">
        {/* Backspace */}
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => handleTouch(e, onBackspace)}
          className={`flex-[1.4] min-w-[38px] max-w-[50px] h-11 sm:h-12 bg-neutral-200/80 dark:bg-neutral-800/90 rounded-lg text-neutral-700 dark:text-neutral-200 shadow-2xs border border-neutral-300/60 dark:border-neutral-700/80 flex items-center justify-center transition-all duration-75 active:scale-95 active:bg-neutral-300 dark:active:bg-neutral-700 ${
            isKeyActive('Backspace') ? 'bg-rose-200 dark:bg-rose-900/60 border-rose-400 scale-95' : ''
          } ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-neutral-300/80 dark:hover:bg-neutral-700'}`}
          aria-label="退格"
        >
          <Delete className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
        </button>

        {row3.map((char) => (
          <button
            key={char}
            type="button"
            disabled={disabled}
            onClick={(e) => handleTouch(e, () => onKeyPress(char))}
            className={`flex-1 min-w-[28px] max-w-[38px] h-11 sm:h-12 bg-white dark:bg-neutral-800 rounded-lg text-base sm:text-lg font-semibold text-neutral-800 dark:text-neutral-100 shadow-2xs border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-center transition-all duration-75 active:scale-95 active:bg-neutral-200 dark:active:bg-neutral-700 ${
              isKeyActive(char) ? 'bg-emerald-200 dark:bg-emerald-800/80 border-emerald-400 dark:border-emerald-500 scale-95' : ''
            } ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'}`}
          >
            {char === '-' ? '-' : char.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Row 4: Control keys (Hint, Space, Enter) */}
      <div className="flex justify-between gap-1.5 px-0.5">
        {/* Hint button */}
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => handleTouch(e, onHint)}
          className={`px-3 py-2.5 h-11 sm:h-12 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-2xs border transition-all duration-75 active:scale-95 ${
            usedHint
              ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
              : 'bg-neutral-200/80 dark:bg-neutral-800/90 border-neutral-300/60 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-300/80 dark:hover:bg-neutral-700'
          } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <Lightbulb className={`w-4 h-4 ${usedHint ? 'fill-amber-500 text-amber-600 dark:text-amber-400' : ''}`} />
          <span className="hidden sm:inline">提示</span>
        </button>

        {/* Space bar */}
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => handleTouch(e, () => onKeyPress(' '))}
          className={`flex-1 h-11 sm:h-12 bg-white dark:bg-neutral-800 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 shadow-2xs border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-center transition-all duration-75 active:scale-95 active:bg-neutral-200 dark:active:bg-neutral-700 ${
            isKeyActive(' ') ? 'bg-emerald-200 dark:bg-emerald-800/80 border-emerald-400 dark:border-emerald-500 scale-95' : ''
          } ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'}`}
        >
          SPACE
        </button>

        {/* Enter / Submit button */}
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => handleTouch(e, onEnter)}
          className={`px-4 py-2.5 h-11 sm:h-12 bg-emerald-800 dark:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs border border-emerald-900 dark:border-emerald-600 transition-all duration-75 active:scale-95 hover:bg-emerald-900 dark:hover:bg-emerald-600 ${
            isKeyActive('Enter') ? 'bg-emerald-950 dark:bg-emerald-900 scale-95' : ''
          } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <span>确认</span>
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
