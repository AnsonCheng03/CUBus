import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cubus.app",
  appName: "CU Bus",
  webDir: "dist",
  server: {
    hostname: "cu-bus.online",
  },
};

export default config;
