import React, { useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import type { SelectionOption } from '../SelectionModal';
import { RouteSearchLocationChooser } from './RouteSearchLocationChooser';

export function RouteSearchStationFields({
  startValue,
  destValue,
  options,
  onChangeStart,
  onChangeDest,
  onUseNearbyStart,
  onUseNearbyDest,
  t,
}: {
  startValue: string;
  destValue: string;
  options: string[];
  onChangeStart: (value: string) => void;
  onChangeDest: (value: string) => void;
  onUseNearbyStart: () => void;
  onUseNearbyDest: () => void;
  t: (value: string) => string;
}) {
  const [openField, setOpenField] = useState<'start' | 'dest' | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stationOptions = useMemo<SelectionOption[]>(
    () => options.map((option) => ({ label: option, value: option })),
    [options],
  );

  const clearPendingClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const closeFieldWithDelay = (field: 'start' | 'dest') => {
    clearPendingClose();
    closeTimeoutRef.current = setTimeout(() => {
      setOpenField((current) => (current === field ? null : current));
    }, 120);
  };

  return (
    <View style={styles.searchBoxes}>
      <View style={styles.infoBox}>
        <View style={styles.routeDotIcon}>
          <Ionicons name="ellipsis-vertical" size={18} color="#630a10" />
        </View>

        <RouteSearchLocationChooser
          value={startValue}
          open={openField === 'start'}
          options={stationOptions}
          placeholder={t('input-text-reminder')}
          locationIconName="locate-outline"
          showTopBorder={false}
          onChangeText={onChangeStart}
          onFocus={() => {
            clearPendingClose();
            setOpenField('start');
          }}
          onBlur={() => closeFieldWithDelay('start')}
          onToggle={() => {
            clearPendingClose();
            setOpenField((current) => (current === 'start' ? null : 'start'));
          }}
          onSelect={(value) => {
            clearPendingClose();
            onChangeStart(value);
            setOpenField(null);
          }}
          onUseNearby={onUseNearbyStart}
        />

        <RouteSearchLocationChooser
          value={destValue}
          open={openField === 'dest'}
          options={stationOptions}
          placeholder={t('input-text-reminder')}
          locationIconName="location-outline"
          onChangeText={onChangeDest}
          onFocus={() => {
            clearPendingClose();
            setOpenField('dest');
          }}
          onBlur={() => closeFieldWithDelay('dest')}
          onToggle={() => {
            clearPendingClose();
            setOpenField((current) => (current === 'dest' ? null : 'dest'));
          }}
          onSelect={(value) => {
            clearPendingClose();
            onChangeDest(value);
            setOpenField(null);
          }}
          onUseNearby={onUseNearbyDest}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBoxes: {
    borderRadius: 15,
    shadowColor: '#a6adc9',
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    backgroundColor: '#fff',
    position: 'relative',
  },
  infoBox: {
    position: 'relative',
    paddingHorizontal: 10,
  },
  routeDotIcon: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 10,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    paddingTop: 2,
  },
});
