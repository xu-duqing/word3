import React, { useState, useEffect, useRef } from 'react';
import { Volume2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Word } from '../types';
import { speakEnglishWord, playCorrectSound, playErrorSound, playTapSound } from '../utils/sound';
import { VirtualKeyboard } from './VirtualKeyboard';

interface SpellingCardProps {
  word: Word;
  soundEnabled: boolean;
  onAnswer: (isCorrect: boolean, usedHint: boolean) => void;
}

export const SpellingCard: React.FC<SpellingCardProps> = ({
  word,
  soundEnabled,
  onAnswer,
}) => {
  const targetWord = word.word.trim();
  const wordLength = targetWord.length;

  const [inputVal, setInputVal] = useState('');
  const [hintIndices, setHintIndices] = useState<number[]>([]);
  const [usedHint, setUsedHint] = useState(false);
  const [status, setStatus] = useState<'typing' | 'correct' | 'wrong'>('typing');
  const [shake, setShake] = useState(false);
  const [activePhysicalKey, setActivePhysicalKey] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto focus & speak on word change
  useEffect(() => {
    setInputVal('');
    setHintIndices([]);
    setUsedHint(false);
    setStatus('typing');
    setShake(false);

    if (timerRef.current) clearTimeout(timerRef.current);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [word]);

  const handleSpeak = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    speakEnglishWord(targetWord, soundEnabled);
  };

  const handleKeyPress = (char: string) => {
    if (status !== 'typing') return;
    playTapSound(soundEnabled);

    const nextVal = (inputVal + char.toLowerCase()).slice(0, wordLength);
    setInputVal(nextVal);

    if (nextVal.length === wordLength) {
      checkAnswer(nextVal);
    }
  };

  const handleBackspace = () => {
    if (status !== 'typing') return;
    playTapSound(soundEnabled);
    setInputVal((prev) => prev.slice(0, -1));
  };

  const checkAnswer = (typed: string) => {
    if (typed.trim().toLowerCase() === targetWord.toLowerCase()) {
      // Correct!
      setStatus('correct');
      playCorrectSound(soundEnabled);
      speakEnglishWord(targetWord, soundEnabled);

      timerRef.current = setTimeout(() => {
        onAnswer(true, usedHint);
      }, 400);
    } else {
      // Wrong
      triggerWrongState();
    }
  };

  const triggerWrongState = () => {
    setStatus('wrong');
    setShake(true);
    playErrorSound(soundEnabled);
    speakEnglishWord(targetWord, soundEnabled);

    setTimeout(() => setShake(false), 500);

    // Auto advance after 3 seconds or user can click
    timerRef.current = setTimeout(() => {
      onAnswer(false, usedHint);
    }, 3000);
  };

  const handleHintClick = () => {
    if (status !== 'typing') return;
    playTapSound(soundEnabled);

    setUsedHint(true);

    const unrevealed: number[] = [];
    for (let i = 0; i < wordLength; i++) {
      if (!hintIndices.includes(i)) {
        unrevealed.push(i);
      }
    }

    if (unrevealed.length > 0) {
      const randomIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      const newHints = [...hintIndices, randomIndex];
      setHintIndices(newHints);

      let updatedTyped = inputVal.split('');
      while (updatedTyped.length < wordLength) updatedTyped.push('');

      for (const idx of newHints) {
        updatedTyped[idx] = targetWord[idx].toLowerCase();
      }

      const newString = updatedTyped.join('').slice(0, wordLength);
      setInputVal(newString);

      if (newString.length === wordLength && newString.toLowerCase() === targetWord.toLowerCase()) {
        checkAnswer(newString);
      }
    }
  };

  const handleSkipOrNext = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (status === 'wrong') {
      onAnswer(false, usedHint);
    } else if (status === 'correct') {
      onAnswer(true, usedHint);
    } else {
      triggerWrongState();
    }
  };

  // Hardware keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing into modal inputs / search bar
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA') &&
        !(activeEl as HTMLElement).hasAttribute('data-virtual-keyboard-input')
      ) {
        return;
      }

      const key = e.key;

      if (key === 'Enter') {
        e.preventDefault();
        setActivePhysicalKey('Enter');
        setTimeout(() => setActivePhysicalKey(null), 150);

        if (status === 'typing') {
          checkAnswer(inputVal);
        } else {
          handleSkipOrNext();
        }
      } else if (key === 'Backspace') {
        e.preventDefault();
        setActivePhysicalKey('Backspace');
        setTimeout(() => setActivePhysicalKey(null), 150);
        handleBackspace();
      } else if (key.length === 1 && /[a-zA-Z\s\-']/.test(key)) {
        e.preventDefault();
        setActivePhysicalKey(key);
        setTimeout(() => setActivePhysicalKey(null), 150);
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputVal, status, wordLength, targetWord, hintIndices]);

  // Render placeholders
  const renderPlaceholders = () => {
    const chars = targetWord.split('');

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 my-6 pointer-events-none">
        {chars.map((char, index) => {
          const typedChar = inputVal[index] || '';
          const isHintRevealed = hintIndices.includes(index);
          const isSpace = char === ' ';
          const isHyphen = char === '-';

          if (isSpace) {
            return <div key={index} className="w-4 h-10" />;
          }

          let borderClass = 'border-b-2 border-neutral-300 dark:border-neutral-700';
          let textClass = 'text-neutral-900 dark:text-neutral-100';

          if (status === 'correct') {
            borderClass = 'border-b-2 border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200';
          } else if (status === 'wrong') {
            borderClass = 'border-b-2 border-rose-500 bg-rose-50/60 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200';
          } else if (typedChar) {
            borderClass = 'border-b-2 border-neutral-800 dark:border-neutral-200 font-semibold';
          } else if (isHintRevealed) {
            borderClass = 'border-b-2 border-amber-400 bg-amber-50/50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200';
          }

          return (
            <div
              key={index}
              className={`w-9 h-11 sm:w-11 sm:h-12 flex items-center justify-center text-xl sm:text-2xl font-mono font-bold rounded-t-lg transition-all ${borderClass} ${textClass}`}
            >
              {isHyphen ? '-' : status === 'wrong' ? targetWord[index] : typedChar || (isHintRevealed ? targetWord[index] : '')}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto px-2 sm:px-4 py-2 select-none">
      {/* Main Card */}
      <div
        className={`relative w-full bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 shadow-xs border border-neutral-200/80 dark:border-neutral-800 transition-all duration-300 ${
          shake ? 'animate-shake border-rose-400 shadow-rose-100 dark:shadow-rose-950' : ''
        } ${status === 'correct' ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20' : ''}`}
      >
        {/* Chinese Meaning & POS Display */}
        <div className="text-center my-3 space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            {word.pos && (
              <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                {word.pos}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
              {word.meaning}
            </h2>
          </div>

          {word.phonetic && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 pt-0.5">
              <span>{word.phonetic}</span>
              <button
                onClick={handleSpeak}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Letter Placeholders */}
        {renderPlaceholders()}

        {/* Status Action Row - Constant Height Container to prevent Card Resizing */}
        <div className="min-h-[44px] flex items-center justify-center mt-2">
          {status === 'correct' && (
            <div className="flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
              <span>拼写正确！即将跳转下一个</span>
            </div>
          )}

          {status === 'wrong' && (
            <button
              onClick={handleSkipOrNext}
              className="w-full py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition active:scale-98 animate-fade-in"
            >
              <XCircle className="w-4 h-4 text-rose-500" />
              <span>拼写错误 · 点击或按回车继续</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Built-in Custom Virtual Keyboard (Stays rendered to prevent layout jump) */}
      <div className="mt-4 w-full">
        <VirtualKeyboard
          onKeyPress={status === 'typing' ? handleKeyPress : handleSkipOrNext}
          onBackspace={status === 'typing' ? handleBackspace : () => {}}
          onEnter={status === 'typing' ? () => checkAnswer(inputVal) : handleSkipOrNext}
          onHint={handleHintClick}
          disabled={status === 'correct'}
          usedHint={usedHint}
          activeKey={activePhysicalKey}
        />
      </div>
    </div>
  );
};
