import React, { useState, useEffect, useRef } from 'react';
import { Volume2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Word } from '../types';
import { formatFullMeaning } from '../utils/algorithm';
import { speakEnglishWord, playCorrectSound, playErrorSound, playTapSound } from '../utils/sound';

interface ChoiceCardProps {
  word: Word;
  options: string[];
  soundEnabled: boolean;
  onAnswer: (isCorrect: boolean) => void;
}

export const ChoiceCard: React.FC<ChoiceCardProps> = ({
  word,
  options,
  soundEnabled,
  onAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const correctMeaning = formatFullMeaning(word);

  useEffect(() => {
    setSelectedOption(null);
    setStatus('idle');

    if (timerRef.current) clearTimeout(timerRef.current);

    // Auto pronounce word on card load
    speakEnglishWord(word.word, soundEnabled);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [word]);

  const handleSpeak = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    speakEnglishWord(word.word, soundEnabled);
  };

  const handleSelectOption = (opt: string) => {
    if (status !== 'idle') return;

    setSelectedOption(opt);
    playTapSound(soundEnabled);

    if (opt === correctMeaning) {
      // Correct!
      setStatus('correct');
      playCorrectSound(soundEnabled);

      timerRef.current = setTimeout(() => {
        onAnswer(true);
      }, 400);
    } else {
      // Wrong: play sound and wait for manual user advance
      setStatus('wrong');
      playErrorSound(soundEnabled);
    }
  };

  const handleSkipOrNext = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (status === 'wrong') {
      onAnswer(false);
    } else if (status === 'correct') {
      onAnswer(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status === 'wrong' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleSkipOrNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 select-none">
      <div className="w-full bg-white dark:bg-neutral-900 rounded-3xl p-7 shadow-xs border border-neutral-200/80 dark:border-neutral-800 transition-all">
        {/* English Word & Audio */}
        <div className="text-center my-4 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
              {word.word}
            </h1>
            <button
              onClick={handleSpeak}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 active:scale-95"
              title="朗读发音"
            >
              <Volume2 className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            </button>
          </div>

          {word.phonetic && (
            <p className="text-sm font-mono text-neutral-600 dark:text-neutral-400">
              {word.phonetic}
            </p>
          )}
        </div>

        {/* 4 Options Grid */}
        <div className="space-y-2.5 my-6">
          {options.map((opt, index) => {
            const isSelected = selectedOption === opt;
            const isCorrectOption = opt === correctMeaning;

            let btnStyle = 'bg-white dark:bg-neutral-800/90 hover:bg-neutral-50/80 dark:hover:bg-neutral-700/80 border-neutral-200/90 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100';

            if (status === 'correct') {
              if (isSelected) {
                btnStyle = 'bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-500 text-white font-semibold shadow-xs';
              }
            } else if (status === 'wrong') {
              if (isSelected) {
                btnStyle = 'bg-rose-500 dark:bg-rose-600 border-rose-600 dark:border-rose-500 text-white font-semibold';
              } else if (isCorrectOption) {
                btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold ring-2 ring-emerald-400/40';
              } else {
                btnStyle = 'bg-neutral-50/50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 opacity-60';
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleSelectOption(opt)}
                disabled={status !== 'idle'}
                className={`w-full p-4 text-left rounded-2xl border text-sm sm:text-base font-medium transition-all duration-200 flex items-center justify-between group active:scale-[0.99] ${btnStyle}`}
              >
                <span className="leading-snug">{opt}</span>

                {/* Icons inside options */}
                {status === 'correct' && isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                )}
                {status === 'wrong' && isSelected && (
                  <XCircle className="w-5 h-5 text-white shrink-0" />
                )}
                {status === 'wrong' && isCorrectOption && !isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 fill-emerald-100 dark:fill-emerald-950" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action / Next prompt */}
        {status === 'correct' && (
          <div className="flex items-center justify-center gap-2 py-1 text-emerald-800 dark:text-emerald-300 font-semibold text-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>回答正确，即刻跳转...</span>
          </div>
        )}

        {status === 'wrong' && (
          <div className="pt-2 text-center animate-fade-in">
            <button
              onClick={handleSkipOrNext}
              className="w-full py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <XCircle className="w-4 h-4 text-rose-500" />
              <span>回答错误 · 点击或按回车继续</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
