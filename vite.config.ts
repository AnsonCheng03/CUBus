/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { chunkSplitPlugin } from "vite-plugin-chunk-split";

import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy(),
    chunkSplitPlugin({
      strategy: "default",
    }),
    VitePWA({ registerType: "autoUpdate" }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
