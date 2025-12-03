import path from 'node:path';
import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    legacy(),
    chunkSplitPlugin({
      strategy: 'default',
      // Group big/vendor libs to keep entry chunks smaller and improve caching.
      customSplitting: {
        'react-vendor': [
          /node_modules\/react/,
          /node_modules\/react-dom/,
          /node_modules\/react-router/,
          /node_modules\/react-router-dom/,
          /node_modules\/@remix-run/,
        ],
        'ionic-vendor': [/node_modules\/@ionic/, /node_modules\/ionicons/],
        'capacitor-vendor': [/node_modules\/@capacitor/],
        'i18n-vendor': [/node_modules\/i18next/, /node_modules\/react-i18next/],
        'sentry-vendor': [/node_modules\/@sentry/],
        'data-vendor': [/node_modules\/axios/, /node_modules\/redux/, /node_modules\/react-redux/],
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        short_name: 'CU BUS',
        name: '中大巴士資訊站 CUHK BUS INFOPAGE',
        description:
          '中大巴士資訊站提供點對點路線搜尋、實時校巴查詢服務，讓你輕鬆在中大校園穿梭。 CUHK Bus Infopage provides point-to-point route search and real-time school bus query services, allowing you to travel around the CUHK campus easily.',
        icons: [
          {
            src: 'assets/icon/favicon.png',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
          },
          {
            src: 'assets/icon/icon.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'maskable',
          },
        ],
        start_url: '.',
        scope: '/',
        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#ffffff',
      },
    }),
  ],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@entities': path.resolve(__dirname, 'src/entities'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
});
