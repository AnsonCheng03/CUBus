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
  const translatedHint = t(hint, { ns: 'preset', defaultValue: hint });
  const showBootScreen = bootStatus === 'initializing';
  // Mount the app behind the opaque boot screen so route/layout assets settle
  // before the loading screen is removed. The navigation is never visible
  // while booting.
  const showAppContent = bootStatus === 'initializing' || bootStatus === 'ready';

  if (bootStatus === 'recoverable-error') {
    return (
      <AppStatusScreen
        title="CU Bus"
        hint={translatedHint}
        body={
          <Text style={{ color: '#6b5c2e', textAlign: 'center', lineHeight: 22 }}>
            A startup sync failed. You can retry the boot flow or reset local data and rebuild from seed data.
          </Text>
        }
        actions={[
          { label: t('retry_btn', { ns: 'preset' }), onPress: () => retryBoot().catch(() => {}) },
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
            {missingData.length > 0 ? missingData.join(', ') : translatedHint}
          </Text>
        }
        actions={[
          { label: t('reset_app', { ns: 'preset' }), onPress: () => resetApp().catch(() => {}) },
          { label: t('retry_btn', { ns: 'preset' }), onPress: () => retryBoot().catch(() => {}), tone: 'secondary' },
        ]}
      />
    );
  }

  return (
    <View style={styles.container}>
      {showAppContent ? (
        <>
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
        </>
      ) : null}

      {showBootScreen ? (
        <View
          pointerEvents={bootStatus === 'initializing' ? 'auto' : 'none'}
          style={styles.bootOverlay}
        >
          <AppStatusScreen
            title="CU Bus"
            hint={translatedHint}
            loading
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#911f27',
  },
  content: {
    flex: 1,
  },
  bootOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    elevation: 100,
    backgroundColor: '#fff',
  },
});
