import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { I18nextProvider } from 'react-i18next';
import { i18next } from '../src/lib/i18n';
import { AppProvider, useAppState } from '../src/providers/AppProvider';
import { NoticeBanner } from '../src/components/NoticeBanner';
import { mobileQueryClient } from '../src/query/client';
import { useReactQueryAppFocus } from '../src/query/focusManager';
import { applyGlobalTypographyDefaults } from '../src/lib/typography';
import { initSentry } from '../src/lib/sentry';
import { AppDownloadPrompt } from '../src/components/AppDownloadPrompt';

initSentry();

applyGlobalTypographyDefaults();

function AppFrame() {
  useReactQueryAppFocus();
  const { appData } = useAppState();

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }} />
      <NoticeBanner notice={appData.notice} />
      <AppDownloadPrompt />
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
