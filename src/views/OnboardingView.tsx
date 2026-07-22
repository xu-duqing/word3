import React, { useState } from 'react';
import { Check, ChevronRight, Upload, ArrowLeft } from 'lucide-react';
import { Library } from '../types';
import { BUILT_IN_LIBRARIES } from '../data/builtInLibraries';

interface OnboardingViewProps {
  libraries: Library[];
  onComplete: (selectedLibraryId: string, dailyGoal: number) => void;
  onCustomImportRequest: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  libraries = BUILT_IN_LIBRARIES,
  onComplete,
  onCustomImportRequest,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLibId, setSelectedLibId] = useState<string>('kaoyan');
  const [dailyGoal, setDailyGoal] = useState<number>(20);

  const goalOptions = [10, 20, 30, 50, 100, 200];

  const getEstimatedMinutes = (goal: number) => {
    return Math.round(goal * 0.3); // ~0.3 mins per word practice
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onComplete(selectedLibId, dailyGoal);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2] flex flex-col justify-between p-4 sm:p-6 select-none animate-fade-in">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between my-auto py-4">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold text-neutral-400 tracking-wider uppercase">
            Step {step} / 2
          </span>
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>上一步</span>
            </button>
          )}
        </div>

        {/* STEP 1: Select Library */}
        {step === 1 && (
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                选个词库，开始背
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                只做一次，永久跳过
              </p>
            </div>

            {/* Library List */}
            <div className="space-y-3 my-2 flex-1 overflow-y-auto max-h-[420px] pr-1">
              {libraries.map((lib) => {
                const isSelected = selectedLibId === lib.id;
                return (
                  <button
                    key={lib.id}
                    onClick={() => setSelectedLibId(lib.id)}
                    className={`w-full p-4.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 ${
                      isSelected
                        ? 'border-[#183b2b] bg-white ring-2 ring-[#183b2b]/10 shadow-xs'
                        : 'border-neutral-200/80 bg-white/70 hover:bg-white text-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-neutral-900 text-sm sm:text-base">
                        {lib.name}
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {lib.description}
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                        isSelected
                          ? 'border-[#183b2b] bg-[#183b2b] text-white'
                          : 'border-neutral-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Import Link */}
            <div>
              <button
                onClick={onCustomImportRequest}
                className="w-full py-3 px-4 border border-dashed border-neutral-300 hover:border-neutral-400 bg-white/50 rounded-2xl text-xs text-neutral-600 hover:text-neutral-900 flex items-center justify-center gap-2 transition"
              >
                <Upload className="w-4 h-4 text-neutral-500" />
                <span>或者导入本地词库 (支持 .txt, .csv)</span>
              </button>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextStep}
              className="w-full py-4 bg-[#183b2b] hover:bg-[#122e22] text-white font-semibold rounded-2xl shadow-sm text-base flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>下一步</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Set Daily Goal */}
        {step === 2 && (
          <div className="space-y-8 flex-1 flex flex-col justify-between py-4">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                每天背多少？
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                目标量力而行，重在每日坚持
              </p>
            </div>

            {/* Interactive Goal Display */}
            <div className="my-8 text-center space-y-6">
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setDailyGoal((prev) => Math.max(10, prev - 10))}
                  className="w-12 h-12 rounded-full bg-neutral-200/80 hover:bg-neutral-300 active:scale-95 text-neutral-800 text-2xl font-bold flex items-center justify-center transition"
                >
                  -
                </button>

                <div className="text-6xl sm:text-7xl font-extrabold text-[#183b2b] font-mono tracking-tight w-36">
                  {dailyGoal}
                </div>

                <button
                  onClick={() => setDailyGoal((prev) => Math.min(200, prev + 10))}
                  className="w-12 h-12 rounded-full bg-neutral-200/80 hover:bg-neutral-300 active:scale-95 text-neutral-800 text-2xl font-bold flex items-center justify-center transition"
                >
                  +
                </button>
              </div>

              {/* Quick Pills */}
              <div className="flex items-center justify-center gap-2.5 flex-wrap pt-2">
                {goalOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setDailyGoal(opt)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition ${
                      dailyGoal === opt
                        ? 'bg-[#183b2b] text-white shadow-xs'
                        : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <p className="text-xs text-neutral-400">
                大约需要 <span className="font-semibold text-neutral-700">{getEstimatedMinutes(dailyGoal)}</span> 分钟
              </p>
            </div>

            {/* Complete Button */}
            <button
              onClick={handleNextStep}
              className="w-full py-4 bg-[#183b2b] hover:bg-[#122e22] text-white font-semibold rounded-2xl shadow-sm text-base transition active:scale-98"
            >
              开始背词
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
