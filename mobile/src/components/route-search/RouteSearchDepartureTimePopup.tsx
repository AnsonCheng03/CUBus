import React, { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RouteSearchPickerValues } from '../../types/mobile';

const weekdays = ['WK-Mon', 'WK-Tue', 'WK-Wed', 'WK-Thu', 'WK-Fri', 'WK-Sat', 'WK-Sun'];
const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const PICKER_ITEM_HEIGHT = 40;
const PICKER_SIDE_PADDING = PICKER_ITEM_HEIGHT * 2;
const SHEET_MIN_HEIGHT = 360;
const SHEET_DEFAULT_RATIO = 0.72;

export function RouteSearchDepartureTimePopup({
  open,
  departNow,
  values,
  travelDateOptions,
  onClose,
  onChangeDepartNow,
  onChangeWeekday,
  onChangeDate,
  onChangeHour,
  onChangeMinute,
  t,
}: {
  open: boolean;
  departNow: boolean;
  values: RouteSearchPickerValues;
  travelDateOptions: string[];
  onClose: () => void;
  onChangeDepartNow: (value: boolean) => void;
  onChangeWeekday: (value: string) => void;
  onChangeDate: (value: string) => void;
  onChangeHour: (value: string) => void;
  onChangeMinute: (value: string) => void;
  t: (value: string) => string;
}) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [isMounted, setIsMounted] = useState(open);
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;
  const availableHeight = Math.max(windowHeight - insets.top - 12, SHEET_MIN_HEIGHT);
  const defaultHeight = Math.max(SHEET_MIN_HEIGHT, Math.round(availableHeight * SHEET_DEFAULT_RATIO));
  const scheduledSummary =
    `${t(values.weekday)} ${values.weekday === 'WK-Sun' ? '' : t(values.date)} ${values.hour}:${values.minute}`.trim();
  const headerTitle = departNow ? t('info-deptnow') : t('select-depart-time');
  const headerSummary = departNow ? t('info-deptnow') : scheduledSummary;

  useEffect(() => {
    if (open) {
      setIsMounted(true);
    }

    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !open) {
        setIsMounted(false);
      }
    });
  }, [open, progress]);
  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      transparent
      visible
      onRequestClose={onClose}
      statusBarTranslucent
      animationType="none"
    >
      <View style={styles.modalRoot} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          <Pressable style={styles.backdropPressable} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.popup,
            {
              opacity: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [320, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.popupSurface,
              {
                paddingBottom: 14 + insets.bottom,
                minHeight: defaultHeight,
                maxHeight: availableHeight,
              },
            ]}
          >
            <View style={styles.handleArea}>
              <View style={styles.handle} />
            </View>

            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.title}>{headerTitle}</Text>
                <Text style={styles.summary}>{headerSummary}</Text>
              </View>
              <Pressable hitSlop={8} onPress={onClose} style={styles.doneButton}>
                <Text style={styles.done}>Done</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.content}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modeRow}>
                <Pressable
                  style={[styles.modeOption, departNow && styles.modeOptionActive]}
                  onPress={() => onChangeDepartNow(true)}
                >
                  <Text style={[styles.modeTitle, departNow && styles.modeTitleActive]}>
                    {t('info-deptnow')}
                  </Text>
                  <Text style={[styles.modeHint, departNow && styles.modeHintActive]}>
                    {t('info-deptnow')}
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.modeOption, !departNow && styles.modeOptionActive]}
                  onPress={() => onChangeDepartNow(false)}
                >
                  <Text style={[styles.modeTitle, !departNow && styles.modeTitleActive]}>
                    {t('select-depart-time')}
                  </Text>
                  <Text style={[styles.modeHint, !departNow && styles.modeHintActive]}>
                    {scheduledSummary}
                  </Text>
                </Pressable>
              </View>

              {departNow ? null : (
                <>
                  <View style={styles.pickerCard}>
                    <Text style={styles.pickerTitle}>設定出發時間</Text>

                    <View style={styles.pickerColumns}>
                      <PickerColumn
                        label="星期"
                        options={weekdays}
                        selectedValue={values.weekday}
                        onSelect={(value) => {
                          onChangeWeekday(value);
                          if (value === 'WK-Sun') {
                            onChangeDate('HD');
                          }
                        }}
                        renderLabel={t}
                        flex={1.5}
                      />

                      <PickerColumn
                        label="日子類型"
                        options={travelDateOptions}
                        selectedValue={values.date}
                        onSelect={onChangeDate}
                        renderLabel={t}
                        flex={1.2}
                        disabled={values.weekday === 'WK-Sun'}
                      />

                      <PickerColumn
                        label="時"
                        options={hours}
                        selectedValue={values.hour}
                        onSelect={onChangeHour}
                        flex={0.75}
                      />

                      <PickerColumn
                        label="分"
                        options={minutes}
                        selectedValue={values.minute}
                        onSelect={onChangeMinute}
                        flex={0.75}
                      />
                    </View>

                    <View style={styles.hintRow}>
                      <Ionicons name="information-circle-outline" size={16} color="#8b6c61" />
                      <Text style={styles.hintText}>時間可設定為未來 7 日內</Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function PickerColumn({
  label,
  options,
  selectedValue,
  onSelect,
  renderLabel,
  flex = 1,
  disabled = false,
}: {
  label: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  renderLabel?: (value: string) => string;
  flex?: number;
  disabled?: boolean;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = Math.max(options.indexOf(selectedValue), 0);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      y: selectedIndex * PICKER_ITEM_HEIGHT,
      animated: false,
    });
  }, [selectedIndex]);

  return (
    <View style={[styles.pickerColumn, { flex }]}>
      <Text style={[styles.pickerColumnLabel, disabled && styles.pickerColumnLabelDisabled]}>
        {label}
      </Text>
      <View style={[styles.pickerWheel, disabled && styles.pickerWheelDisabled]}>
        <View
          pointerEvents="none"
          style={[styles.pickerSelectionBand, disabled && styles.pickerSelectionBandDisabled]}
        />
        <ScrollView
          ref={scrollRef}
          scrollEnabled={!disabled}
          showsVerticalScrollIndicator={false}
          snapToInterval={PICKER_ITEM_HEIGHT}
          decelerationRate="fast"
          contentContainerStyle={styles.pickerWheelContent}
          onMomentumScrollEnd={(event) => {
            if (disabled) {
              return;
            }
            const nextIndex = Math.round(event.nativeEvent.contentOffset.y / PICKER_ITEM_HEIGHT);
            const clampedIndex = Math.max(0, Math.min(nextIndex, options.length - 1));
            onSelect(options[clampedIndex]);
          }}
        >
          {options.map((option) => {
            const selected = option === selectedValue;
            return (
              <Pressable
                key={option}
                disabled={disabled}
                style={styles.pickerItem}
                onPress={() => onSelect(option)}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selected && styles.pickerItemTextSelected,
                    disabled && styles.pickerItemTextDisabled,
                    disabled && selected && styles.pickerItemTextSelectedDisabled,
                  ]}
                >
                  {renderLabel ? renderLabel(option) : option}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(26, 20, 16, 0.3)',
  },
  backdropPressable: {
    flex: 1,
  },
  popup: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#3f4b68',
    shadowOpacity: 0.2,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
    elevation: 18,
    zIndex: 40,
    overflow: 'visible',
  },
  popupSurface: {
    backgroundColor: '#fffaf3',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#eadccd',
    overflow: 'hidden',
    paddingBottom: 14,
  },
  handleArea: {
    paddingTop: 10,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#d6c6b8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eadccd',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: '#2f1b16',
    fontSize: 18,
    fontWeight: '800',
  },
  summary: {
    color: '#7f675e',
    fontSize: 13,
    marginTop: 3,
  },
  doneButton: {
    backgroundColor: '#630a10',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  done: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  content: {
    gap: 12,
    padding: 16,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeOption: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#eadccd',
    backgroundColor: '#fffdf9',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 4,
  },
  modeOptionActive: {
    backgroundColor: '#630a10',
    borderColor: '#630a10',
  },
  modeTitle: {
    color: '#2f1b16',
    fontSize: 15,
    fontWeight: '800',
  },
  modeTitleActive: {
    color: '#fff',
  },
  modeHint: {
    color: '#7f675e',
    fontSize: 12,
    lineHeight: 16,
  },
  modeHintActive: {
    color: 'rgba(255,255,255,0.82)',
  },
  pickerCard: {
    borderRadius: 18,
    backgroundColor: '#fffaf3',
    borderWidth: 1,
    borderColor: '#eadccd',
    padding: 16,
    gap: 16,
  },
  pickerTitle: {
    color: '#2f1b16',
    fontSize: 16,
    fontWeight: '700',
  },
  pickerColumns: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  pickerColumn: {
    minWidth: 0,
    gap: 8,
  },
  pickerColumnLabel: {
    color: '#8b6c61',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  pickerColumnLabelDisabled: {
    color: '#b7a69b',
  },
  pickerWheel: {
    height: PICKER_ITEM_HEIGHT * 5,
    borderRadius: 16,
    backgroundColor: '#fffdf9',
    borderWidth: 1,
    borderColor: '#eadccd',
    overflow: 'hidden',
    position: 'relative',
  },
  pickerWheelDisabled: {
    backgroundColor: '#f6efe7',
    borderColor: '#ece1d6',
  },
  pickerSelectionBand: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: PICKER_SIDE_PADDING,
    height: PICKER_ITEM_HEIGHT,
    borderRadius: 12,
    backgroundColor: '#f3e6db',
    borderWidth: 1,
    borderColor: '#e4cfc1',
    zIndex: 0,
  },
  pickerSelectionBandDisabled: {
    backgroundColor: '#efe6dc',
    borderColor: '#e7d9cd',
  },
  pickerWheelContent: {
    paddingVertical: PICKER_SIDE_PADDING,
  },
  pickerItem: {
    height: PICKER_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pickerItemText: {
    color: '#6b6f67',
    fontSize: 14,
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    color: '#2f1b16',
    fontSize: 15,
    fontWeight: '700',
  },
  pickerItemTextDisabled: {
    color: '#b4a297',
  },
  pickerItemTextSelectedDisabled: {
    color: '#8f7d72',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  hintText: {
    color: '#8b6c61',
    fontSize: 12,
  },
});
