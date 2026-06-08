import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function PermitHero({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.heroSection}>
      <View style={styles.heroBadge}>
        <Text style={styles.heroBadgeText}>{badge}</Text>
      </View>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 34,
    backgroundColor: '#911f27',
    gap: 10,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroBadgeText: {
    color: '#fff4ea',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    lineHeight: 21,
  },
});
