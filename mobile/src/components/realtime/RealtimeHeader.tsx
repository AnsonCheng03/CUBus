import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { FloatingStationSelector } from '../FloatingStationSelector';
import type { SelectionOption } from '../SelectionModal';
import { BusMovingImage } from './BusMovingImage';

export function RealtimeHeader({
  paddingTop,
  stationLabel,
  pickerOpen,
  stationOptions,
  onTogglePicker,
  onSelectStation,
  onLocate,
}: {
  paddingTop: number;
  stationLabel: string;
  pickerOpen: boolean;
  stationOptions: SelectionOption[];
  onTogglePicker: () => void;
  onSelectStation: (value: string) => void;
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
        <FloatingStationSelector
          value={stationLabel}
          open={pickerOpen}
          options={stationOptions}
          onToggle={onTogglePicker}
          onSelect={onSelectStation}
          onLocate={onLocate}
        />
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
    zIndex: 20,
    elevation: 20,
  },
  whiteHeaderBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
});
