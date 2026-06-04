import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { I18nextProvider } from 'react-i18next';
import * as Sentry from '@sentry/react-native';
import { i18next } from '../src/lib/i18n';
import { AppProvider, useAppState } from '../src/providers/AppProvider';
import { env } from '../src/lib/config';
import { NoticeBanner } from '../src/components/NoticeBanner';
import { mobileQueryClient } from '../src/query/client';
import { useReactQueryAppFocus } from '../src/query/focusManager';
import { applyGlobalTypographyDefaults } from '../src/lib/typography';

if (env.sentryDsn) {
  Sentry.init({ dsn: env.sentryDsn, tracesSampleRate: 1.0 });
}

applyGlobalTypographyDefaults();

function AppFrame() {
  useReactQueryAppFocus();
  const { appData } = useAppState();

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }} />
      <NoticeBanner notice={appData.notice} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18next}>
      <QueryClientProvider client={mobileQueryClient}>
        <AppProvider>
          <AppFrame />
        </AppProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
