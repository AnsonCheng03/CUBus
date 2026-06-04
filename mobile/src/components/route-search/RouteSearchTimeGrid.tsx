import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type PickerType = 'weekday' | 'date' | 'hour' | 'minute';

export function RouteSearchTimeGrid({
  values,
  onSelect,
}: {
  values: { weekday: string; date: string; hour: string; minute: string };
  onSelect: (type: PickerType) => void;
}) {
  const items: Array<{ type: PickerType; label: string; value: string }> = [
    { type: 'weekday', label: 'Weekday', value: values.weekday },
    { type: 'date', label: 'Date', value: values.date },
    { type: 'hour', label: 'Hour', value: values.hour },
    { type: 'minute', label: 'Minute', value: values.minute },
  ];

  return (
    <View style={styles.timeGrid}>
      {items.map((item) => (
        <Pressable key={item.type} style={styles.timeChip} onPress={() => onSelect(item.type)}>
          <Text style={styles.timeChipLabel}>{item.label}</Text>
          <Text style={styles.timeChipValue}>{item.value}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChip: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#630a10',
  },
  timeChipLabel: {
    color: '#333',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  timeChipValue: {
    color: '#111',
    fontWeight: '800',
  },
});
