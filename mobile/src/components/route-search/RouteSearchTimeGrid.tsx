import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type PickerType = 'weekday' | 'date' | 'hour' | 'minute';

export function RouteSearchTimeGrid({
  values,
  onSelect,
  t,
}: {
  values: { weekday: string; date: string; hour: string; minute: string };
  onSelect: (type: PickerType) => void;
  t: (value: string) => string;
}) {
  return (
    <View style={styles.timeGrid}>
      <View style={styles.timeRow}>
        <Pressable style={styles.timeSelectWide} onPress={() => onSelect('weekday')}>
          <Text style={styles.timeSelectValue}>{t(values.weekday)}</Text>
        </Pressable>
        {values.weekday === 'WK-Sun' ? null : (
          <Pressable style={styles.timeSelectWide} onPress={() => onSelect('date')}>
            <Text style={styles.timeSelectValue}>{t(values.date)}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.timeRow}>
        <Pressable style={styles.timeSelectNarrow} onPress={() => onSelect('hour')}>
          <Text style={styles.timeSelectValue}>{values.hour}</Text>
        </Pressable>
        <Text style={styles.timeSeparator}>:</Text>
        <Pressable style={styles.timeSelectNarrow} onPress={() => onSelect('minute')}>
          <Text style={styles.timeSelectValue}>{values.minute}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timeGrid: {
    gap: 10,
    paddingTop: 6,
    paddingBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  timeSelectWide: {
    flex: 1,
    minHeight: 34,
    borderWidth: 1,
    borderColor: '#630a10',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  timeSelectNarrow: {
    width: 72,
    minHeight: 34,
    borderWidth: 1,
    borderColor: '#630a10',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  timeSelectValue: {
    color: '#111',
    fontSize: 14,
    textAlign: 'center',
  },
  timeSeparator: {
    color: '#630a10',
    fontSize: 20,
    fontWeight: '700',
  },
});
