import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../src/providers/AppProvider';
import { AppStatusScreen } from '../../src/components/AppStatusScreen';

export default function TabsLayout() {
  const { t } = useTranslation(['global', 'preset']);
  const { hint, bootStatus, missingData, retryBoot, resetApp } = useAppState();

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
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0f766e',
        tabBarStyle: {
          backgroundColor: '#fffdf8',
          borderTopColor: '#ddd5c4',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('NAV-Home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="bus-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="route"
        options={{
          title: t('NAV-StationSearch'),
          tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="permit"
        options={{
          title: t('NAV-Permit'),
          tabBarIcon: ({ color, size }) => <Ionicons name="card-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('NAV-Settings'),
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
