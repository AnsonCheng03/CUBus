import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { FloatingSelectorPopup } from './FloatingSelectorPopup';
import type { SelectionOption } from './SelectionModal';

export function FloatingStationSelector({
  value,
  open,
  options,
  popupHeight = 280,
  placeholder,
  leading,
  onToggle,
  onSelect,
  onLocate,
  editable = false,
  onChangeText,
  onFocus,
  onBlur,
  filterOptions = false,
  maxVisibleOptions = 8,
  showLocateButton = true,
  showChevron = true,
  containerStyle,
  boxStyle,
  iconStyle,
  buttonStyle,
  valueStyle,
  inputStyle,
}: {
  value: string;
  open: boolean;
  options: SelectionOption[];
  popupHeight?: number;
  placeholder?: string;
  leading?: React.ReactNode;
  onToggle: () => void;
  onSelect: (value: string) => void;
  onLocate?: () => void;
  editable?: boolean;
  onChangeText?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  filterOptions?: boolean;
  maxVisibleOptions?: number;
  showLocateButton?: boolean;
  showChevron?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  boxStyle?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  valueStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
}) {
  const openProgress = useRef(new Animated.Value(open ? 1 : 0)).current;
  const displayValue = value.trim() || placeholder || '';
  const hasLeading = leading !== false;
  const filteredOptions = useMemo(() => {
    const normalizedValue = value.trim().toLowerCase();
    const nextOptions =
      filterOptions && normalizedValue
        ? options.filter((option) => option.label.toLowerCase().includes(normalizedValue))
        : options;

    return nextOptions.slice(0, maxVisibleOptions);
  }, [filterOptions, maxVisibleOptions, options, value]);

  useEffect(() => {
    Animated.timing(openProgress, {
      toValue: open ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [open, openProgress]);

  return (
    <View style={[styles.selectorFloat, containerStyle]}>
      <Animated.View
        style={[
          styles.selectorBox,
          open && styles.selectorBoxOpen,
          {
            shadowOpacity: openProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 0],
            }),
            shadowRadius: openProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [1.5, 0],
            }),
            shadowOffset: {
              width: 0,
              height: openProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [4, 0],
              }),
            },
            elevation: openProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [6, 0],
            }),
          },
          boxStyle,
        ]}
      >
        {hasLeading ? (
          <View style={[styles.selectorIcon, iconStyle]}>
            {leading ?? (
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M16 16.01L16.01 15.9989"
                  stroke="#111"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M6 16.01L6.01 15.9989"
                  stroke="#111"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M20 22V15V8M20 8H18L18 2H22V8H20Z"
                  stroke="#111"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M16 20H2.6C2.26863 20 2 19.7314 2 19.4V12.6C2 12.2686 2.26863 12 2.6 12H16"
                  stroke="#111"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M14 8H6M14 2H6C3.79086 2 2 3.79086 2 6V8"
                  stroke="#111"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M3.5 20V21.9C3.5 22.2314 3.76863 22.5 4.1 22.5H6.9C7.23137 22.5 7.5 22.2314 7.5 21.9V20"
                  stroke="#111"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <Path
                  d="M14.5 20V21.9C14.5 22.2314 14.7686 22.5 15.1 22.5H16"
                  stroke="#111"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
            )}
          </View>
        ) : null}
        {editable ? (
          <View
            style={[
              styles.selectorButton,
              !showChevron && styles.selectorButtonNoChevron,
              buttonStyle,
            ]}
          >
            <TextInput
              value={value}
              onChangeText={onChangeText}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={placeholder}
              placeholderTextColor="#7b8d87"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              style={[styles.selectorInput, inputStyle]}
            />
            {showChevron ? (
              <Pressable hitSlop={8} onPress={onToggle}>
                <Ionicons
                  name={open ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#666"
                  style={styles.chevron}
                />
              </Pressable>
            ) : null}
          </View>
        ) : (
          <Pressable style={[styles.selectorButton, buttonStyle]} onPress={onToggle}>
            <Text
              style={[
                styles.selectorValue,
                !value.trim() && styles.selectorValuePlaceholder,
                valueStyle,
              ]}
              numberOfLines={1}
            >
              {displayValue}
            </Text>
            {showChevron ? (
              <Ionicons
                name={open ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#666"
                style={styles.chevron}
              />
            ) : null}
          </Pressable>
        )}
        {showLocateButton && onLocate ? (
          <Pressable hitSlop={8} style={styles.gpsButton} onPress={onLocate}>
            <Ionicons name="navigate-circle" size={26} color="#2196f3" />
          </Pressable>
        ) : null}
      </Animated.View>
      <View pointerEvents="box-none" style={styles.popupOverlay}>
        <FloatingSelectorPopup
          open={open}
          height={popupHeight}
          options={filteredOptions}
          onSelect={onSelect}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  selectorFloat: {
    position: 'relative',
    overflow: 'visible',
    zIndex: 30,
    elevation: 30,
  },
  selectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: '2%',
    shadowColor: '#a6adc9',
    shadowOpacity: 0.4,
    shadowRadius: 1.5,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  selectorBoxOpen: {},
  selectorIcon: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorButton: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  selectorButtonNoChevron: {
    paddingRight: 0,
  },
  selectorValue: {
    flex: 1,
    color: '#000',
    fontSize: 20,
    marginRight: 8,
  },
  selectorValuePlaceholder: {
    color: '#7b8d87',
  },
  selectorInput: {
    flex: 1,
    color: '#000',
    fontSize: 20,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginRight: 8,
  },
  chevron: {
    marginRight: 2,
  },
  gpsButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupOverlay: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: -10,
  },
});
