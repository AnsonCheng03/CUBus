import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppState } from '../providers/AppProvider';
import { NoticeBanner } from './NoticeBanner';

export function ScreenContainer({
  title,
  subtitle,
  children,
  refreshControl,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  refreshControl?: React.ReactElement;
}) {
  const { appData } = useAppState();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={refreshControl}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <NoticeBanner notice={appData.notice} />
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3efe4',
  },
  content: {
    padding: 18,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#183a33',
  },
  subtitle: {
    color: '#5a6c65',
    fontSize: 15,
    lineHeight: 22,
  },
});
