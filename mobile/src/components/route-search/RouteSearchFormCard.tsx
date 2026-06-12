import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteSearchTimeGrid } from './RouteSearchTimeGrid';
import { RouteSearchStationFields } from './RouteSearchStationFields';

export function RouteSearchFormCard({
  startValue,
  destValue,
  options,
  onChangeStart,
  onChangeDest,
  onUseNearbyStart,
  onUseNearbyDest,
  departNow,
  onToggleDepartNow,
  timeValues,
  onSelectTimeField,
  t,
}: {
  startValue: string;
  destValue: string;
  options: string[];
  onChangeStart: (value: string) => void;
  onChangeDest: (value: string) => void;
  onUseNearbyStart: () => void;
  onUseNearbyDest: () => void;
  departNow: boolean;
  onToggleDepartNow: (value: boolean) => void;
  timeValues: { weekday: string; date: string; hour: string; minute: string };
  onSelectTimeField: (type: 'weekday' | 'date' | 'hour' | 'minute') => void;
  t: (value: string) => string;
}) {
  const departTimeText = departNow
    ? t('info-deptnow')
    : `${t(timeValues.weekday)} ${timeValues.weekday === 'WK-Sun' ? '' : t(timeValues.date)} ${timeValues.hour}:${timeValues.minute}`.trim();

  return (
    <View style={styles.formShell}>
      <View style={styles.timeChooserContainer}>
        <View style={styles.timeChooserIcon}>
          <Ionicons name="time-outline" size={22} color="#fff" />
        </View>
        <Pressable style={styles.departureMode} onPress={() => onToggleDepartNow(!departNow)}>
          <Text style={styles.departureModeText}>{departTimeText}</Text>
          <Ionicons name="chevron-down" size={18} color="#fff" />
        </Pressable>
      </View>

      {!departNow ? (
        <View style={styles.timeGridShell}>
          <RouteSearchTimeGrid values={timeValues} onSelect={onSelectTimeField} t={t} />
        </View>
      ) : null}

      <RouteSearchStationFields
        startValue={startValue}
        destValue={destValue}
        options={options}
        onChangeStart={onChangeStart}
        onChangeDest={onChangeDest}
        onUseNearbyStart={onUseNearbyStart}
        onUseNearbyDest={onUseNearbyDest}
        t={t}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  formShell: {
    gap: 8,
  },
  timeChooserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  timeChooserIcon: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  departureMode: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  departureModeText: {
    color: '#fff',
    fontSize: 20,
    paddingVertical: 8,
  },
  timeGridShell: {
    paddingLeft: 50,
  },
});
