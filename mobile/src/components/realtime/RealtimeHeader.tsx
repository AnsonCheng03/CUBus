import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { FloatingStationSelector } from '../FloatingStationSelector';
import { BusMovingImage } from './BusMovingImage';

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
  const [selectorHeight, setSelectorHeight] = useState(0);

  const onSelectorLayout = (event: LayoutChangeEvent) => {
    setSelectorHeight(event.nativeEvent.layout.height);
  };

  return (
    <View style={[styles.redHeader, { paddingTop }]}>
      <View
        style={[
          styles.whiteHeaderBackdrop,
          { height: selectorHeight / 2 + styles.redHeader.paddingBottom },
        ]}
      />
      <BusMovingImage />
      <View onLayout={onSelectorLayout}>
        <FloatingStationSelector value={stationLabel} onOpen={onOpen} onLocate={onLocate} />
      </View>
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
    backgroundColor: '#fff',
  },
});
