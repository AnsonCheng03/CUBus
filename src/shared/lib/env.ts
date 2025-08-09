type Env = {
  VITE_LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
  VITE_API_BASE?: string;
};

export const env: Env = {
  VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL,
  VITE_API_BASE: import.meta.env.VITE_API_BASE,
};
