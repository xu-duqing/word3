import { registerSW } from 'virtual:pwa-register';

/**
 * 初始化 PWA Service Worker
 * 并在应用切回前台（visibilitychange / focus）时主动向服务器检查更新
 */
export function initPWA() {
  const updateSW = registerSW({
    immediate: true,
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
    onOfflineReady() {
      console.log('三连背单词：已就绪，支持离线访问');
    },
  });

  return updateSW;
}
