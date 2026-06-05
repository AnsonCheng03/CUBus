import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RouteBusIcon } from './RouteBusIcon';
import type { RealtimeRowData } from '../types/mobile';

export function RealtimeBusRow({
  bus,
  onPress,
  t,
  showTopBorder = true,
}: {
  bus: RealtimeRowData;
  onPress: () => void;
  t: (key: string) => string;
  showTopBorder?: boolean;
}) {
  const canOpenRouteMap = Boolean(bus.nextStation?.route?.length);

  return (
    <Pressable
      style={[
        styles.busRow,
        !showTopBorder && styles.busRowNoBorder,
        bus.arrived && styles.busRowArrived,
        !canOpenRouteMap && styles.busRowDisabled,
      ]}
      disabled={!canOpenRouteMap}
      onPress={onPress}
    >
      <View style={styles.busLeft}>
        <View style={styles.busIconWrap}>
          <RouteBusIcon
            busNo={bus.busno}
            colorCode={bus.config?.colorCode}
            direction={bus.direction}
          />
        </View>
      </View>

      <View style={styles.nextStationDisplay}>
        <Text style={styles.nextStationLabel}>
          {bus.nextStation?.importantStationAfter?.[0]
            ? t('next-important-station')
            : t('next-station')}
        </Text>
        <Text style={styles.nextStationValue} numberOfLines={1}>
          {bus.nextStation?.importantStationAfter?.[0] ?? t(bus.nextStation?.stationName ?? '')}
        </Text>
        {bus.config?.scheduleType === 'reported' ? (
          <Text style={styles.infoText}>
            {(bus.config?.scheduleConfig?.count ?? 1) + ' ' + t('bus-reported-by-user')}
          </Text>
        ) : bus.warning ? (
          <Text style={styles.warningText}>{t(bus.warning)}</Text>
        ) : null}
      </View>

      <Text style={styles.arrivalTime}>{bus.time}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  busRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: '7%',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    minHeight: 65,
    gap: 18,
  },
  busRowArrived: {
    opacity: 0.5,
  },
  busRowDisabled: {
    opacity: 0.75,
  },
  busRowNoBorder: {
    borderTopWidth: 0,
  },
  busLeft: {
    width: 50,
    alignItems: 'center',
  },
  busIconWrap: {
    width: 50,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStationDisplay: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 10,
  },
  nextStationLabel: {
    width: 27,
    fontSize: 12,
    color: '#333',
    textAlign: 'right',
  },
  nextStationValue: {
    flex: 1,
    color: '#111',
    fontSize: 19,
  },
  infoText: {
    marginLeft: 37,
    color: '#2196f3',
    fontSize: 11,
    width: '100%',
  },
  warningText: {
    marginLeft: 37,
    color: 'red',
    fontSize: 11,
    width: '100%',
  },
  arrivalTime: {
    width: 80,
    textAlign: 'right',
    fontSize: 24,
    color: '#111',
  },
});
