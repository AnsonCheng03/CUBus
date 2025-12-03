type Env = {
  VITE_LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
  VITE_BASE_URL?: string; // your dev API base if any
};

export const env: Env = {
  VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL,
  VITE_BASE_URL: import.meta.env.VITE_BASE_URL,
};
