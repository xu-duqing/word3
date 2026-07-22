import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Upload, RotateCcw, Volume2, Check } from 'lucide-react';
import { Library, UserProgress } from '../types';
import { parseCustomLibraryText } from '../utils/storage';

interface SettingsModalProps {
  progress: UserProgress;
  libraries: Library[];
  activeLibrary?: Library;
  onUpdateProgress: (newProgress: Partial<UserProgress>) => void;
  onSwitchLibrary: (libraryId: string) => void;
  onResetLibrary: (libraryId: string) => void;
  onImportCustomLibrary: (name: string, parsedWords: { word: string; meaning: string; pos?: string }[]) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  progress,
  libraries,
  activeLibrary,
  onUpdateProgress,
  onSwitchLibrary,
  onResetLibrary,
  onImportCustomLibrary,
  onClose,
}) => {
  const [showLibPicker, setShowLibPicker] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Importer state
  const [importName, setImportName] = useState('');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  const goalOptions = [10, 20, 30, 50, 100, 200];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!importName) {
      const defaultName = file.name.replace(/\.[^/.]+$/, '');
      setImportName(defaultName);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!importName.trim()) {
      setImportError('请输入词库名称');
      return;
    }
    if (!importText.trim()) {
      setImportError('请粘贴或上传包含单词与释义的文本');
      return;
    }

    const parsed = parseCustomLibraryText(importText);
    if (parsed.length === 0) {
      setImportError('未识别到有效格式。请按 "word, 意思" 或 "word = 意思" 格式排版');
      return;
    }

    onImportCustomLibrary(importName.trim(), parsed);
    setShowImporter(false);
    setImportName('');
    setImportText('');
    setImportError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#faf9f6] rounded-[32px] p-6 shadow-2xl border border-neutral-200/90 flex flex-col max-h-[90vh] overflow-y-auto select-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-200/60 rounded-full transition text-neutral-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-neutral-900">设置</h2>
          <div className="w-8" />
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Section 1: Library Management */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-1">
              词库与目标
            </span>

            <div className="bg-white rounded-2xl border border-neutral-200/80 divide-y divide-neutral-100 overflow-hidden shadow-2xs">
              <button
                onClick={() => setShowLibPicker(true)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50 transition"
              >
                <div>
                  <div className="text-xs text-neutral-400 font-medium">当前词库</div>
                  <div className="text-sm font-semibold text-neutral-900 mt-0.5">
                    {activeLibrary?.name || '未知词库'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>

              <button
                onClick={() => setShowImporter(true)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50 transition"
              >
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span className="text-sm font-medium text-neutral-800">导入本地词库</span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>

              <button
                onClick={() => setShowGoalPicker(true)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50 transition"
              >
                <div>
                  <div className="text-xs text-neutral-400 font-medium">每日目标</div>
                  <div className="text-sm font-semibold text-neutral-900 mt-0.5">
                    {progress.dailyGoal} 词 / 天
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </div>

          {/* Section 2: Audio Preferences */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-1">
              偏好设置
            </span>

            <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-neutral-600" />
                  <span className="text-xs font-medium text-neutral-800">按键与音效反馈</span>
                </div>
                <input
                  type="checkbox"
                  checked={progress.soundEnabled}
                  onChange={(e) => onUpdateProgress({ soundEnabled: e.target.checked })}
                  className="w-4 h-4 accent-[#183b2b] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dangerous Zone (Reset Progress) */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full p-3.5 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-2xl text-rose-800 font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重置当前词库通关记录</span>
            </button>
          </div>

          <div className="text-center text-[10px] text-neutral-400 pt-2">
            极简背单词 v1.0.0 · 开门见山，零干扰背词
          </div>
        </div>

        {/* Library Switcher Sub-Modal */}
        {showLibPicker && (
          <div className="fixed inset-0 z-60 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-neutral-900 text-sm">切换激活词库</h3>
                <button
                  onClick={() => setShowLibPicker(false)}
                  className="text-xs text-neutral-400 hover:text-neutral-700"
                >
                  关闭
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {libraries.map((lib) => {
                  const isCurrent = lib.id === progress.activeLibraryId;
                  return (
                    <button
                      key={lib.id}
                      onClick={() => {
                        onSwitchLibrary(lib.id);
                        setShowLibPicker(false);
                      }}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition ${
                        isCurrent
                          ? 'border-[#183b2b] bg-emerald-50/50 font-bold text-neutral-900'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      <span>{lib.name}</span>
                      {isCurrent && <Check className="w-4 h-4 text-[#183b2b]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Daily Goal Picker Sub-Modal */}
        {showGoalPicker && (
          <div className="fixed inset-0 z-60 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-scale-up">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-neutral-900 text-sm">修改每日背词目标</h3>
                <button
                  onClick={() => setShowGoalPicker(false)}
                  className="text-xs text-neutral-400 hover:text-neutral-700"
                >
                  关闭
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {goalOptions.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => {
                      onUpdateProgress({ dailyGoal: goal });
                      setShowGoalPicker(false);
                    }}
                    className={`py-3 rounded-xl border font-mono font-bold text-sm transition ${
                      progress.dailyGoal === goal
                        ? 'bg-[#183b2b] text-white border-[#183b2b]'
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200'
                    }`}
                  >
                    {goal} 词
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Custom Importer Sub-Modal */}
        {showImporter && (
          <div className="fixed inset-0 z-60 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-neutral-900 text-sm">导入自定义本地词库</h3>
                <button
                  onClick={() => setShowImporter(false)}
                  className="text-xs text-neutral-400 hover:text-neutral-700"
                >
                  关闭
                </button>
              </div>

              {importError && (
                <div className="p-2.5 bg-rose-50 text-rose-800 rounded-xl text-xs">
                  {importError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    词库名称
                  </label>
                  <input
                    type="text"
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                    placeholder="如：我的精准备考词汇"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-hidden focus:border-neutral-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    文件选择或文本粘贴 (.txt / .csv)
                  </label>
                  <input
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-neutral-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">
                    词汇格式（支持 "单词, 意思" 或 "word = 意思"）
                  </label>
                  <textarea
                    rows={6}
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder={`abandon, v. 放弃\nability, n. 能力\naccommodate = v. 容纳`}
                    className="w-full p-3 border border-neutral-200 rounded-xl text-xs font-mono focus:outline-hidden focus:border-neutral-400"
                  />
                </div>

                <button
                  onClick={handleConfirmImport}
                  className="w-full py-3 bg-[#183b2b] text-white font-semibold text-xs rounded-xl shadow-xs hover:bg-[#122e22] transition active:scale-98"
                >
                  确认导入词库
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset Progress Confirmation Dialog */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-60 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-center">
              <h3 className="font-bold text-neutral-900 text-sm">确认重置记录？</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                这将会清空当前词库 <span className="font-semibold text-neutral-800">{activeLibrary?.name}</span> 的所有连续正确次数与通关标志，重新开始通关。
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold text-xs transition"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (activeLibrary) {
                      onResetLibrary(activeLibrary.id);
                    }
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs transition shadow-2xs"
                >
                  确认重置
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
