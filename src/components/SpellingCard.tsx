import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Lightbulb, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
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

          let borderClass = 'border-b-2 border-neutral-300';
          let textClass = 'text-neutral-900';

          if (status === 'correct') {
            borderClass = 'border-b-2 border-emerald-500 bg-emerald-50/60 text-emerald-900';
          } else if (status === 'wrong') {
            borderClass = 'border-b-2 border-rose-500 bg-rose-50/60 text-rose-900';
          } else if (typedChar) {
            borderClass = 'border-b-2 border-neutral-800 font-semibold';
          } else if (isHintRevealed) {
            borderClass = 'border-b-2 border-amber-400 bg-amber-50/50 text-amber-900';
          }

          return (
            <div
              key={index}
              className={`w-9 h-11 sm:w-11 sm:h-12 flex items-center justify-center text-xl sm:text-2xl font-mono font-bold rounded-t-lg transition-all ${borderClass} ${textClass}`}
            >
              {isHyphen ? '-' : typedChar || (isHintRevealed ? targetWord[index] : '')}
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
        className={`relative w-full bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-neutral-200/80 transition-all duration-300 ${
          shake ? 'animate-shake border-rose-400 shadow-rose-100' : ''
        } ${status === 'correct' ? 'border-emerald-400 bg-emerald-50/20' : ''}`}
      >
        {/* Card Header: Mode badge + Hint button */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full">
            看中文拼单词
          </span>

          <button
            onClick={handleHintClick}
            disabled={status !== 'typing'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition active:scale-95 ${
              usedHint
                ? 'bg-amber-100 text-amber-800'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
            title="提示会透露 1 个字母，且视同答错"
          >
            <Lightbulb className={`w-3.5 h-3.5 ${usedHint ? 'fill-amber-500 text-amber-600' : ''}`} />
            <span>提示</span>
          </button>
        </div>

        {/* Chinese Meaning & POS Display */}
        <div className="text-center my-4 space-y-2">
          <div className="flex items-center justify-center gap-2">
            {word.pos && (
              <span className="text-sm font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                {word.pos}
              </span>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-snug">
              {word.meaning}
            </h2>
          </div>

          <p className="text-xs text-neutral-600 font-normal">
            这个单词有 <span className="font-semibold text-neutral-800">{wordLength}</span> 个字母
            {usedHint && <span className="text-amber-800 ml-1">(已使用提示，本次计错)</span>}
          </p>

          {word.phonetic && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-600 pt-1">
              <span>{word.phonetic}</span>
              <button
                onClick={handleSpeak}
                className="p-1 hover:bg-neutral-100 rounded-full transition text-neutral-600 hover:text-neutral-900"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Letter Placeholders */}
        {renderPlaceholders()}

        {/* Status Feedback / Next action banner */}
        {status === 'correct' && (
          <div className="flex items-center justify-center gap-2 py-2 text-emerald-800 font-semibold text-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
            <span>拼写正确！即将跳转下一个</span>
          </div>
        )}

        {status === 'wrong' && (
          <div className="space-y-3 py-1 text-center animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-rose-800 font-semibold text-sm">
              <XCircle className="w-5 h-5 text-rose-600 fill-rose-100" />
              <span>拼写错误</span>
            </div>

            <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-3 text-center">
              <p className="text-xs text-rose-800 mb-1 font-medium">正确拼写：</p>
              <p className="text-xl font-mono font-bold text-rose-900 tracking-wider">
                {targetWord}
              </p>
            </div>

            <button
              onClick={handleSkipOrNext}
              className="w-full mt-2 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <span>立即继续</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Built-in Custom Virtual Keyboard (Zero iOS OS Keyboard Glitches) */}
      <VirtualKeyboard
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onEnter={status === 'typing' ? () => checkAnswer(inputVal) : handleSkipOrNext}
        onHint={handleHintClick}
        disabled={status !== 'typing'}
        usedHint={usedHint}
        activeKey={activePhysicalKey}
      />
    </div>
  );
};
