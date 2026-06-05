import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { FloatingSelectorPopup } from './FloatingSelectorPopup';
import type { SelectionOption } from './SelectionModal';

export function FloatingStationSelector({
  value,
  open,
  options,
  popupHeight = 280,
  onToggle,
  onSelect,
  onLocate,
}: {
  value: string;
  open: boolean;
  options: SelectionOption[];
  popupHeight?: number;
  onToggle: () => void;
  onSelect: (value: string) => void;
  onLocate: () => void;
}) {
  const openProgress = useRef(new Animated.Value(open ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(openProgress, {
      toValue: open ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [open, openProgress]);

  return (
    <View style={styles.selectorFloat}>
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
        ]}
      >
        <View style={styles.selectorIcon}>
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
        </View>
        <Pressable style={styles.selectorButton} onPress={onToggle}>
          <Text style={styles.selectorValue} numberOfLines={1}>
            {value}
          </Text>
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#666"
            style={styles.chevron}
          />
        </Pressable>
        <Pressable style={styles.gpsButton} onPress={onLocate}>
          <Ionicons name="navigate-circle" size={26} color="#2196f3" />
        </Pressable>
      </Animated.View>
      <View style={styles.popupOverlay}>
        <FloatingSelectorPopup
          open={open}
          height={popupHeight}
          options={options}
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
  selectorValue: {
    flex: 1,
    color: '#000',
    fontSize: 20,
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
