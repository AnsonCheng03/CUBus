import React, { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FloatingSelectorPopup } from '../FloatingSelectorPopup';
import type { SelectionOption } from '../SelectionModal';
import type { RouteSearchPickerValues } from '../../types/mobile';
import { RouteSearchDepartureTimePopup } from './RouteSearchDepartureTimePopup';
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
  travelDateOptions,
  onChangeWeekday,
  onChangeDate,
  onChangeHour,
  onChangeMinute,
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
  timeValues: RouteSearchPickerValues;
  travelDateOptions: string[];
  onChangeWeekday: (value: string) => void;
  onChangeDate: (value: string) => void;
  onChangeHour: (value: string) => void;
  onChangeMinute: (value: string) => void;
  t: (value: string) => string;
}) {
  const [departModeOpen, setDepartModeOpen] = useState(false);
  const [departTimeOpen, setDepartTimeOpen] = useState(false);
  const departModeOptions = useMemo<SelectionOption[]>(
    () => [
      { label: t('info-deptnow'), value: 'now' },
      { label: t('select-depart-time'), value: 'scheduled' },
    ],
    [t],
  );
  const departTimeText = departNow
    ? t('info-deptnow')
    : `${t(timeValues.weekday)} ${timeValues.weekday === 'WK-Sun' ? '' : t(timeValues.date)} ${timeValues.hour}:${timeValues.minute}`.trim();

  return (
    <View style={styles.formShell}>
      <View style={styles.timeChooserContainer}>
        <View style={styles.timeChooserIcon}>
          <Ionicons name="time-outline" size={22} color="#fff" />
        </View>
        <View style={styles.departureModeShell}>
          <Pressable
            style={styles.departureMode}
            onPress={() => {
              if (departModeOpen) {
                setDepartModeOpen(false);
                return;
              }
              setDepartTimeOpen(false);
              setDepartModeOpen(true);
            }}
          >
            <Text style={styles.departureModeText}>{departTimeText}</Text>
            <Ionicons name="chevron-down" size={18} color="#fff" />
          </Pressable>

          <View pointerEvents="box-none" style={styles.popupOverlay}>
            <FloatingSelectorPopup
              open={departModeOpen}
              height={108}
              options={departModeOptions}
              onSelect={(value) => {
                setDepartModeOpen(false);
                if (value === 'now') {
                  onToggleDepartNow(true);
                  setDepartTimeOpen(false);
                  return;
                }
                onToggleDepartNow(false);
                setDepartTimeOpen(true);
              }}
            />
          </View>

          <View pointerEvents="box-none" style={styles.popupOverlay}>
            <RouteSearchDepartureTimePopup
              open={departTimeOpen}
              values={timeValues}
              travelDateOptions={travelDateOptions}
              onClose={() => setDepartTimeOpen(false)}
              onChangeWeekday={onChangeWeekday}
              onChangeDate={onChangeDate}
              onChangeHour={onChangeHour}
              onChangeMinute={onChangeMinute}
              t={t}
            />
          </View>
        </View>
      </View>

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
    zIndex: 40,
    elevation: 40,
  },
  timeChooserIcon: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  departureModeShell: {
    flex: 1,
    position: 'relative',
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
  popupOverlay: {
    position: 'absolute',
    top: '100%',
    left: -50,
    right: 0,
    marginTop: -8,
  },
});
