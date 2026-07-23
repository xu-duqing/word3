import React, { useEffect, useState } from 'react';
import { CircleCheckBig, RefreshCw, X } from 'lucide-react';
import {
  subscribePWA,
  getPWAState,
  applyPWAUpdate,
  dismissPWAUpdate,
  dismissPWAOfflineReady,
} from '../pwa';

/**
 * PWA 新版本提示浮层
 * - 检测到新 Service Worker 时弹出
 * - 用户点「立即更新」后刷新页面应用新版本
 * - 点「稍后」则本次跳过，下次切回前台再次检测到时仍会提示
 * - 首次缓存完成后短暂提示应用已可离线使用
 */
export const PwaUpdatePrompt: React.FC = () => {
  const [pwaState, setPwaState] = useState(getPWAState);

  useEffect(() => {
    const unsub = subscribePWA(() => {
      setPwaState(getPWAState());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!pwaState.offlineReady) return;

    const timer = window.setTimeout(dismissPWAOfflineReady, 6000);
    return () => window.clearTimeout(timer);
  }, [pwaState.offlineReady]);

  if (!pwaState.needRefresh && !pwaState.offlineReady) return null;

  if (pwaState.offlineReady && !pwaState.needRefresh) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-x-0 bottom-0 z-[80] p-4 flex justify-center pointer-events-none animate-fade-in"
      >
        <div className="pointer-events-auto w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200/90 dark:border-neutral-800 p-3.5 flex items-center gap-3 animate-scale-up">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <CircleCheckBig className="w-4.5 h-4.5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              已支持离线使用
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              首次缓存已完成，断网时也可继续背词
            </div>
          </div>

          <button
            type="button"
            onClick={dismissPWAOfflineReady}
            aria-label="关闭离线提示"
            title="关闭"
            className="shrink-0 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="assertive"
      className="fixed inset-x-0 bottom-0 z-[80] p-4 flex justify-center pointer-events-none animate-fade-in"
    >
      <div className="pointer-events-auto w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200/90 dark:border-neutral-800 p-3.5 flex items-center gap-3 animate-scale-up">
        <div className="shrink-0 w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
          <RefreshCw className="w-4.5 h-4.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            发现新版本
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
            立即更新以获取最新功能与修复
          </div>
        </div>

        <button
          onClick={dismissPWAUpdate}
          aria-label="稍后"
          className="shrink-0 px-3 py-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition"
        >
          稍后
        </button>
        <button
          onClick={applyPWAUpdate}
          className="shrink-0 px-3.5 py-1.5 bg-[#183b2b] dark:bg-emerald-700 hover:bg-[#122e22] dark:hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition active:scale-95"
        >
          立即更新
        </button>
      </div>
    </div>
  );
};
