import { useEffect, useRef } from 'react';
import '@khmyznikov/pwa-install';
import type { PWAInstallElement } from '@khmyznikov/pwa-install';
import { loadUserProgress } from '../utils/storage';

export function showPwaInstallPrompt(): void {
  document.querySelector<PWAInstallElement>('pwa-install')?.showDialog(true);
}

export function PwaInstallPrompt() {
  const installRef = useRef<PWAInstallElement>(null);

  useEffect(() => {
    if (loadUserProgress().onboardingCompleted) return;

    const installElement = installRef.current;
    if (!installElement) return;

    let cancelled = false;

    const showBeforeOnboarding = async () => {
      await customElements.whenDefined('pwa-install');
      await installElement.updateComplete;

      if (
        !cancelled &&
        !installElement.isUnderStandaloneMode &&
        !installElement.isRelatedAppsInstalled
      ) {
        installElement.showDialog(true);
      }
    };

    void showBeforeOnboarding();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <pwa-install
      ref={installRef}
      manifest-url="/manifest.webmanifest"
      install-description="安装后可像原生应用一样打开即背，并支持离线使用。"
      useLocalStorage={true}
      styles={{ '--tint-color': '#183b2b' }}
    />
  );
}
