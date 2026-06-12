import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RouteSearchPickerValues } from '../../types/mobile';

const weekdays = ['WK-Mon', 'WK-Tue', 'WK-Wed', 'WK-Thu', 'WK-Fri', 'WK-Sat', 'WK-Sun'];
const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

export function RouteSearchDepartureTimePopup({
  open,
  values,
  travelDateOptions,
  onClose,
  onChangeWeekday,
  onChangeDate,
  onChangeHour,
  onChangeMinute,
  t,
}: {
  open: boolean;
  values: RouteSearchPickerValues;
  travelDateOptions: string[];
  onClose: () => void;
  onChangeWeekday: (value: string) => void;
  onChangeDate: (value: string) => void;
  onChangeHour: (value: string) => void;
  onChangeMinute: (value: string) => void;
  t: (value: string) => string;
}) {
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;
  const summary = `${t(values.weekday)} ${values.weekday === 'WK-Sun' ? '' : t(values.date)} ${values.hour}:${values.minute}`.trim();

  useEffect(() => {
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [open, progress]);

  return (
    <Animated.View
      pointerEvents={open ? 'auto' : 'none'}
      style={[
        styles.popup,
        {
          maxHeight: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 360],
          }),
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        },
      ]}
    >
      <View style={styles.popupSurface}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{t('select-depart-time')}</Text>
            <Text style={styles.summary}>{summary}</Text>
          </View>
          <Pressable hitSlop={8} onPress={onClose}>
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <ChoiceRail
            options={weekdays}
            selectedValue={values.weekday}
            onSelect={(value) => {
              onChangeWeekday(value);
              if (value === 'WK-Sun') {
                onChangeDate('HD');
              }
            }}
            renderLabel={t}
          />

          {values.weekday === 'WK-Sun' ? null : (
            <ChoiceRail
              options={travelDateOptions}
              selectedValue={values.date}
              onSelect={onChangeDate}
              renderLabel={t}
            />
          )}

          <ChoiceRail
            options={hours}
            selectedValue={values.hour}
            onSelect={onChangeHour}
          />

          <ChoiceRail
            options={minutes}
            selectedValue={values.minute}
            onSelect={onChangeMinute}
          />
        </ScrollView>
      </View>
    </Animated.View>
  );
}

function ChoiceRail({
  options,
  selectedValue,
  onSelect,
  renderLabel,
}: {
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  renderLabel?: (value: string) => string;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.railContent}
    >
      {options.map((option) => {
        const selected = option === selectedValue;
        return (
          <Pressable
            key={option}
            style={[styles.optionChip, selected && styles.optionChipSelected]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
              {renderLabel ? renderLabel(option) : option}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  popup: {
    borderRadius: 16,
    shadowColor: '#3f4b68',
    shadowOpacity: 0.34,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 18,
    zIndex: 40,
    overflow: 'hidden',
  },
  popupSurface: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e7ddd1',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ece4da',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#21463e',
    fontSize: 16,
    fontWeight: '700',
  },
  summary: {
    color: '#6c7f79',
    fontSize: 13,
    marginTop: 2,
  },
  done: {
    color: '#630a10',
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    maxHeight: 284,
  },
  content: {
    gap: 12,
    paddingVertical: 12,
  },
  railContent: {
    gap: 8,
    paddingHorizontal: 16,
  },
  optionChip: {
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d9cfc4',
    backgroundColor: '#fffdf8',
  },
  optionChipSelected: {
    borderColor: '#630a10',
    backgroundColor: '#630a10',
  },
  optionLabel: {
    color: '#21463e',
    fontSize: 14,
    fontWeight: '600',
  },
  optionLabelSelected: {
    color: '#fff',
  },
});
