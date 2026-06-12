export const env = {
  baseUrl: process.env.EXPO_PUBLIC_BASE_URL || 'https://cu-bus.online/api/v1/functions',
  sentryDsn:
    process.env.EXPO_PUBLIC_SENTRY_DSN ||
    'https://05bedc8c2dfb23fa8f8b70e735e5f409@o4510470118178816.ingest.us.sentry.io/4510470120275968',
};
