import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../../src/providers/AppProvider';
import { LoadingScreen } from '../../src/components/LoadingScreen';

export default function TabsLayout() {
  const { t } = useTranslation('global');
  const { ready, hint } = useAppState();

  if (!ready) {
    return <LoadingScreen hint={hint} />;
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
