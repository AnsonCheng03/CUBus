import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function SettingsSection({ children }: { children: React.ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

export function SettingsRow({
  label,
  onPress,
  right,
  noDivider = false,
}: {
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
  noDivider?: boolean;
}) {
  const content = (
    <View style={[styles.row, noDivider && styles.rowNoDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      {right}
    </View>
  );

  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#dddddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowNoDivider: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    flex: 1,
    color: '#111',
    fontSize: 16,
  },
});
