import React from 'react';
import { StyleSheet, View } from 'react-native';
import { FloatingStationSelector } from '../FloatingStationSelector';

export function RealtimeHeader({
  paddingTop,
  stationLabel,
  onOpen,
  onLocate,
}: {
  paddingTop: number;
  stationLabel: string;
  onOpen: () => void;
  onLocate: () => void;
}) {
  return (
    <View style={[styles.redHeader, { paddingTop }]}>
      <View style={styles.whiteHeaderBackdrop} />
      <FloatingStationSelector value={stationLabel} onOpen={onOpen} onLocate={onLocate} />
    </View>
  );
}

const styles = StyleSheet.create({
  redHeader: {
    position: 'relative',
    paddingHorizontal: '3%',
    paddingBottom: 10,
    overflow: 'visible',
  },
  whiteHeaderBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    backgroundColor: '#fff',
  },
});
