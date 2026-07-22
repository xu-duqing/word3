import { registerSW } from 'virtual:pwa-register';

// 简易订阅模式：让 React 组件能感知到「有新版本」状态变化
type Listener = () => void;
const listeners = new Set<Listener>();

let _needRefresh = false;
let _offlineReady = false;
let _updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;

/**
 * 初始化 PWA Service Worker
 * - registerType: 'prompt'，新版本不会自动应用，需用户确认
 * - 应用切回前台（visibilitychange / focus）时主动向服务器检查更新
 */
export function initPWA() {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      _needRefresh = true;
      _updateSW = updateSW;
      emit();
    },
    onOfflineReady() {
      _offlineReady = true;
      console.log('三连背单词：已就绪，支持离线访问');
      emit();
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;

      // 1. 切回前台（可见性变为 visible）时检查升级
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && navigator.onLine) {
          registration.update().catch(() => {});
        }
      });

      // 2. 窗口重新获得焦点（focus）时检查升级
      window.addEventListener('focus', () => {
        if (navigator.onLine) {
          registration.update().catch(() => {});
        }
      });
    },
  });

  _updateSW = updateSW;
  return updateSW;
}

function emit() {
  listeners.forEach((l) => l());
}

/** 订阅 PWA 状态变化，返回取消订阅函数 */
export function subscribePWA(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPWAState() {
  return { needRefresh: _needRefresh, offlineReady: _offlineReady };
}

/** 用户确认后应用更新（会刷新页面加载新版本） */
export function applyPWAUpdate() {
  if (_updateSW) {
    _updateSW(true);
  }
}

/** 用户暂时跳过本次更新提示 */
export function dismissPWAUpdate() {
  _needRefresh = false;
  emit();
}
