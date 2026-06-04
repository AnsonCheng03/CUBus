import React from 'react';
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
  View,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

export function ScreenContainer({
  title,
  subtitle,
  children,
  refreshControl,
  contentPadding = 16,
  contentGap = 16,
  headerSpacing = 12,
  showHeader = true,
  contentStyle,
  scrollStyle,
  safeAreaBackgroundColor = '#f2f2f2',
  safeAreaEdges = ['top'],
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  refreshControl?: React.ReactElement;
  contentPadding?: number;
  contentGap?: number;
  headerSpacing?: number;
  showHeader?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  scrollStyle?: StyleProp<ViewStyle>;
  safeAreaBackgroundColor?: string;
  safeAreaEdges?: Edge[];
}) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: safeAreaBackgroundColor }]} edges={safeAreaEdges}>
      <ScrollView
        style={scrollStyle}
        contentContainerStyle={[
          styles.content,
          {
            gap: contentGap,
            paddingHorizontal: contentPadding,
            paddingTop: contentPadding,
            paddingBottom: contentPadding,
          },
          contentStyle,
        ]}
        refreshControl={refreshControl}
      >
        {showHeader ? (
          <View style={[styles.header, { marginBottom: headerSpacing }]}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {},
  header: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    lineHeight: 21,
  },
});
