import React, { useEffect, useState } from 'react';
import { Share, Plus, X, Check } from 'lucide-react';

const DISMISS_KEY = 'm_vocab_ios_pwa_guide_dismissed';

/**
 * 检测当前是否已经在 PWA standalone 模式下运行
 *  - display-mode: standalone（Android / 桌面 PWA）
 *  - window.navigator.standalone（iOS Safari 添加到主屏幕后）
 *  - document.referrer 包含 android-app://（TWA）
 */
export function isPWAStandalone(): boolean {
  try {
    return (
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  } catch {
    return false;
  }
}

/**
 * 判断是否为可安装 PWA 的 iOS 环境（即未以 standalone 模式打开的 iOS Safari）
 *  - 排除 standalone 模式（已安装则不再展示引导）
 *  - 兼容 iPadOS 13+ 桌面版 UA 伪装
 */
export function isIOSPWAInstallable(): boolean {
  const standalone = isPWAStandalone();
  const ua = navigator.userAgent || '';
  // iOS iPhone / iPod / 旧 iPad UA
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  // iPadOS 13+ 上 Safari 默认请求桌面 UA，需通过触屏+Macintosh 识别
  const isIPadOS13Plus =
    /Macintosh/.test(ua) &&
    (navigator.maxTouchPoints > 1 || 'ontouchend' in document);

  const result = !standalone && (isIOS || isIPadOS13Plus);

  // 诊断日志：方便通过 Safari Web Inspector 排查
  console.log('[IOSPwaGuide]', {
    standalone,
    isIOS,
    isIPadOS13Plus,
    ua,
    maxTouchPoints: navigator.maxTouchPoints,
    result,
    dismissed: (() => {
      try { return localStorage.getItem(DISMISS_KEY) === '1'; } catch { return 'error'; }
    })(),
  });

  return result;
}

interface IOSPwaGuideProps {
  /** 是否允许展示（如已完成 onboarding 之后才展示） */
  enabled?: boolean;
  /** 延迟展示时间（毫秒），避免与首屏渲染抢占 */
  delay?: number;
  /** 强制展示（忽略 dismiss 标记，用于设置页手动触发） */
  force?: boolean;
}

/** 清除 dismiss 标记，下次进入页面会重新展示引导 */
export function resetIOSPwaGuideDismiss(): void {
  try {
    localStorage.removeItem(DISMISS_KEY);
  } catch {
    // ignore
  }
}

/**
 * iOS 专属 PWA 安装图文引导浮层
 * 仅在「iOS Safari + 未安装」场景下展示一次，关闭后不再弹出
 */
export const IOSPwaGuide: React.FC<IOSPwaGuideProps> = ({
  enabled = true,
  delay = 800,
  force = false,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled && !force) return;
    if (!force && !isIOSPWAInstallable()) return;

    if (!force) {
      try {
        if (localStorage.getItem(DISMISS_KEY) === '1') return;
      } catch {
        // ignore
      }
    }

    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [enabled, delay, force]);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-neutral-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-[#faf9f6] dark:bg-neutral-900 rounded-[32px] p-6 shadow-2xl border border-neutral-200/90 dark:border-neutral-800 animate-scale-up select-none">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#183b2b] dark:bg-emerald-700 text-white flex items-center justify-center">
              <Share className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              添加到主屏幕
            </h2>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="关闭"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
          将「三连背单词」添加到主屏幕，像原生 App 一样打开即背，远离浏览器干扰。
        </p>

        {/* Step-by-step guide */}
        <ol className="space-y-3 mb-5">
          <li className="flex items-start gap-3">
            <div className="shrink-0 w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-bold flex items-center justify-center">
              1
            </div>
            <div className="flex-1 text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed pt-0.5">
              点击 Safari 底部工具栏的
              <span className="inline-flex items-center align-middle mx-1 px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <Share className="w-3 h-3" />
                <span className="ml-0.5 font-semibold">分享</span>
              </span>
              按钮
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="shrink-0 w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-bold flex items-center justify-center">
              2
            </div>
            <div className="flex-1 text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed pt-0.5">
              在弹出的菜单中找到并点击
              <span className="inline-flex items-center align-middle mx-1 px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <Plus className="w-3 h-3" />
                <span className="ml-0.5 font-semibold">添加到主屏幕</span>
              </span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="shrink-0 w-6 h-6 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-bold flex items-center justify-center">
              3
            </div>
            <div className="flex-1 text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed pt-0.5">
              点击右上角的
              <span className="inline-flex items-center align-middle mx-1 px-1.5 py-0.5 rounded-md bg-[#183b2b] dark:bg-emerald-700 text-white font-semibold">
                添加
              </span>
              ，回到桌面打开即可
            </div>
          </li>
        </ol>

        <button
          onClick={handleDismiss}
          className="w-full py-3 bg-[#183b2b] dark:bg-emerald-700 hover:bg-[#122e22] dark:hover:bg-emerald-800 text-white font-semibold rounded-2xl shadow-sm text-sm transition active:scale-98 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>我知道了</span>
        </button>
      </div>
    </div>
  );
};
