import React, { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FloatingStationSelector } from '../FloatingStationSelector';
import type { SelectionOption } from '../SelectionModal';
import { RouteSearchTimeGrid } from './RouteSearchTimeGrid';

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
  const [openField, setOpenField] = useState<'start' | 'dest' | null>(null);
  const stationOptions = useMemo<SelectionOption[]>(
    () => options.map((option) => ({ label: option, value: option })),
    [options],
  );
  const departTimeText = departNow
    ? t('info-deptnow')
    : `${t(timeValues.weekday)} ${timeValues.weekday === 'WK-Sun' ? '' : t(timeValues.date)} ${timeValues.hour}:${timeValues.minute}`.trim();
  const closeFieldWithDelay = (field: 'start' | 'dest') => {
    setTimeout(() => {
      setOpenField((current) => (current === field ? null : current));
    }, 120);
  };

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

      <View style={styles.searchBoxes}>
        <View style={styles.infoBox}>
          <View style={styles.routeDotIcon}>
            <Ionicons name="ellipsis-vertical" size={18} color="#630a10" />
          </View>

          <View
            style={[
              styles.locationChooserContainer,
              openField === 'start' && styles.locationChooserContainerActive,
            ]}
          >
            <View style={styles.locationChooser}>
              <View style={styles.locationIconCell}>
                <Ionicons name="locate-outline" size={24} color="#630a10" />
              </View>
              <View style={[styles.locationInputContainer, styles.locationInputContainerFirst]}>
                <View
                  style={[
                    styles.locationInput,
                    openField === 'start' && styles.locationInputActive,
                  ]}
                >
                  <FloatingStationSelector
                    value={startValue}
                    open={openField === 'start'}
                    options={stationOptions}
                    placeholder={t('input-text-reminder')}
                    popupHeight={220}
                    editable
                    leading={false}
                    onChangeText={onChangeStart}
                    onFocus={() => setOpenField('start')}
                    onBlur={() => closeFieldWithDelay('start')}
                    onToggle={() =>
                      setOpenField((current) => (current === 'start' ? null : 'start'))
                    }
                    onSelect={(value) => {
                      onChangeStart(value);
                      setOpenField(null);
                    }}
                    showLocateButton={false}
                    showChevron={false}
                    filterOptions
                    boxStyle={styles.inlineSelectorBox}
                    iconStyle={styles.inlineSelectorIcon}
                    buttonStyle={styles.inlineSelectorButton}
                    inputStyle={styles.inlineSelectorValue}
                  />
                </View>
                <Pressable style={styles.functionButton} onPress={onUseNearbyStart}>
                  <Ionicons name="navigate-circle-outline" size={26} color="#630a10" />
                </Pressable>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.locationChooserContainer,
              openField === 'dest' && styles.locationChooserContainerActive,
            ]}
          >
            <View style={styles.locationChooser}>
              <View style={styles.locationIconCell}>
                <Ionicons name="location-outline" size={24} color="#630a10" />
              </View>
              <View style={styles.locationInputContainer}>
                <View
                  style={[styles.locationInput, openField === 'dest' && styles.locationInputActive]}
                >
                  <FloatingStationSelector
                    value={destValue}
                    open={openField === 'dest'}
                    options={stationOptions}
                    placeholder={t('input-text-reminder')}
                    popupHeight={220}
                    editable
                    leading={false}
                    onChangeText={onChangeDest}
                    onFocus={() => setOpenField('dest')}
                    onBlur={() => closeFieldWithDelay('dest')}
                    onToggle={() => setOpenField((current) => (current === 'dest' ? null : 'dest'))}
                    onSelect={(value) => {
                      onChangeDest(value);
                      setOpenField(null);
                    }}
                    showLocateButton={false}
                    showChevron={false}
                    filterOptions
                    boxStyle={styles.inlineSelectorBox}
                    iconStyle={styles.inlineSelectorIcon}
                    buttonStyle={styles.inlineSelectorButton}
                    inputStyle={styles.inlineSelectorValue}
                  />
                </View>
                <Pressable style={styles.functionButton} onPress={onUseNearbyDest}>
                  <Ionicons name="navigate-circle-outline" size={26} color="#630a10" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
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
    paddingVertical: 8,
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
  locationChooserContainer: {
    minHeight: 0,
    position: 'relative',
    zIndex: 0,
  },
  locationChooserContainerActive: {
    zIndex: 20,
    elevation: 20,
  },
  locationChooser: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  locationIconCell: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#630a10',
  },
  locationInputContainerFirst: {
    borderTopWidth: 0,
  },
  locationInput: {
    flex: 1,
    zIndex: 2,
    elevation: 2,
  },
  locationInputActive: {
    zIndex: 30,
    elevation: 30,
  },
  functionButton: {
    width: 38,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  inlineSelectorBox: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  inlineSelectorIcon: {
    width: 0,
    alignItems: 'flex-start',
  },
  inlineSelectorButton: {
    minHeight: 48,
    paddingVertical: 4,
  },
  inlineSelectorValue: {
    fontSize: 20,
    marginRight: 12,
  },
});
