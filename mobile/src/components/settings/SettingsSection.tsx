import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function SettingsSection({ children }: { children: React.ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

export function SettingsRow({
  label,
  description,
  onPress,
  right,
  noDivider = false,
}: {
  label: string;
  description?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  noDivider?: boolean;
}) {
  const content = (
    <View style={[styles.row, noDivider && styles.rowNoDivider]}>
      <View style={styles.rowTextBlock}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
      </View>
      {right}
    </View>
  );

  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(90, 60, 50, 0.08)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  row: {
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ece7e3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowNoDivider: {
    borderBottomWidth: 0,
  },
  rowTextBlock: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
    paddingRight: 8,
  },
  rowLabel: {
    color: '#1d1a19',
    fontSize: 16,
    fontWeight: '500',
  },
  rowDescription: {
    color: '#7a6c66',
    fontSize: 12,
    lineHeight: 17,
  },
});
