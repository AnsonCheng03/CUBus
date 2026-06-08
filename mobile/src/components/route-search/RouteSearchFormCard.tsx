import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AutocompleteField } from '../AutocompleteField';
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

      <View style={styles.searchBoxes}>
        <View style={styles.infoBox}>
          <View style={styles.routeDotIcon}>
            <Ionicons name="ellipsis-vertical" size={18} color="#630a10" />
          </View>

          <View style={styles.locationChooserContainer}>
            <View style={styles.locationChooser}>
              <View style={styles.locationIconCell}>
                <Ionicons name="locate-outline" size={24} color="#630a10" />
              </View>
              <View style={[styles.locationInputContainer, styles.locationInputContainerFirst]}>
                <View style={styles.locationInput}>
                  <AutocompleteField
                    label={t('Form-Start')}
                    value={startValue}
                    onChange={onChangeStart}
                    options={options}
                    placeholder={t('input-text-reminder')}
                  />
                </View>
                <Pressable style={styles.functionButton} onPress={onUseNearbyStart}>
                  <Ionicons name="navigate-circle-outline" size={26} color="#630a10" />
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.locationChooserContainer}>
            <View style={styles.locationChooser}>
              <View style={styles.locationIconCell}>
                <Ionicons name="location-outline" size={24} color="#630a10" />
              </View>
              <View style={styles.locationInputContainer}>
                <View style={styles.locationInput}>
                  <AutocompleteField
                    label={t('Form-Dest')}
                    value={destValue}
                    onChange={onChangeDest}
                    options={options}
                    placeholder={t('input-text-reminder')}
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
  },
  infoBox: {
    position: 'relative',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  routeDotIcon: {
    position: 'absolute',
    top: '50%',
    left: 27,
    marginTop: -9,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  locationChooserContainer: {
    minHeight: 0,
  },
  locationChooser: {
    flexDirection: 'row',
    alignItems: 'center',
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
    gap: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#630a10',
  },
  locationInputContainerFirst: {
    borderTopWidth: 0,
  },
  locationInput: {
    flex: 1,
  },
  functionButton: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
