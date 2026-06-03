import React from 'react';
import { Stack } from 'expo-router';
import { I18nextProvider } from 'react-i18next';
import * as Sentry from '@sentry/react-native';
import { i18next } from '../src/lib/i18n';
import { AppProvider } from '../src/providers/AppProvider';
import { env } from '../src/lib/config';

if (env.sentryDsn) {
  Sentry.init({ dsn: env.sentryDsn, tracesSampleRate: 1.0 });
}

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18next}>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AppProvider>
    </I18nextProvider>
  );
}
