import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CustomNavBar } from '../../src/components/CustomNavBar';
import { useAppState } from '../../src/providers/AppProvider';
import { AppStatusScreen } from '../../src/components/AppStatusScreen';
import { NAV_RESPONSIVE_BREAKPOINT } from '../../src/lib/layout';

export default function TabsLayout() {
  const { t } = useTranslation(['global', 'preset']);
  const { hint, bootStatus, missingData, retryBoot, resetApp } = useAppState();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= NAV_RESPONSIVE_BREAKPOINT;

  if (bootStatus === 'initializing') {
    return <AppStatusScreen title="CU Bus" hint={hint} loading />;
  }

  if (bootStatus === 'recoverable-error') {
    return (
      <AppStatusScreen
        title="CU Bus"
        hint={hint}
        body={
          <Text style={{ color: '#6b5c2e', textAlign: 'center', lineHeight: 22 }}>
            A startup sync failed. You can retry the boot flow or reset local data and rebuild from seed data.
          </Text>
        }
        actions={[
          { label: t('retry_btn', { defaultValue: 'Retry' }), onPress: () => retryBoot().catch(() => {}) },
          { label: t('reset_app', { ns: 'preset' }), onPress: () => resetApp().catch(() => {}), tone: 'secondary' },
        ]}
      />
    );
  }

  if (bootStatus === 'corrupted') {
    return (
      <AppStatusScreen
        title="CU Bus"
        hint={t('app_data_corrupted', { ns: 'preset' })}
        body={
          <Text style={{ color: '#6b5c2e', textAlign: 'center', lineHeight: 22 }}>
            {missingData.length > 0 ? missingData.join(', ') : hint}
          </Text>
        }
        actions={[
          { label: t('reset_app', { ns: 'preset' }), onPress: () => resetApp().catch(() => {}) },
          { label: t('retry_btn', { defaultValue: 'Retry' }), onPress: () => retryBoot().catch(() => {}), tone: 'secondary' },
        ]}
      />
    );
  }

  return (
    <View style={styles.container}>
      {isLargeScreen ? <CustomNavBar /> : null}
      <View style={styles.content}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen name="index" options={{ title: t('NAV-Home') }} />
          <Tabs.Screen name="route" options={{ title: t('NAV-StationSearch') }} />
          <Tabs.Screen name="permit" options={{ title: t('NAV-Permit') }} />
          <Tabs.Screen name="settings" options={{ title: t('NAV-Settings') }} />
        </Tabs>
      </View>
      {!isLargeScreen ? <CustomNavBar /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
