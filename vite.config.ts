import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt', // 检测到更新后由用户确认再应用
        includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'], // 需要缓存的静态资源
        manifest: {
          name: '梧桐背单词',       // 应用完整名称
          short_name: '梧桐背单词',        // 桌面上显示的简称
          description: '零干扰、打开即背的无痛记忆工具',
          lang: 'zh-CN',
          theme_color: '#f7f6f2',          // 状态栏/顶部主题颜色
          background_color: '#f7f6f2',     // 启动屏背景色
          display: 'standalone',           // 独立应用模式（隐藏浏览器地址栏）
          icons: [
            {
              src: 'pwa-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        devOptions: {
          enabled: true // 开发环境下开启 PWA 调试
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
