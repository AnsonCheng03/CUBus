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
      <View style={styles.redHeaderBackdrop} />
      <FloatingStationSelector value={stationLabel} onOpen={onOpen} onLocate={onLocate} />
    </View>
  );
}

const styles = StyleSheet.create({
  redHeader: {
    position: 'relative',
    paddingHorizontal: '3%',
    paddingBottom: 15,
  },
  redHeaderBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 35,
    backgroundColor: '#911f27',
  },
});
