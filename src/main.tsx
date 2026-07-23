import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import './index.css';
import { initPWA } from './pwa';

// 初始化 PWA 并监听前台切回检查更新
initPWA();

createRoot(document.getElementById('root')!).render(
  <>
    <PwaInstallPrompt />
    <StrictMode>
      <App />
    </StrictMode>
  </>,
);
