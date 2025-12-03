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
    VitePWA({ registerType: 'autoUpdate' }),
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
