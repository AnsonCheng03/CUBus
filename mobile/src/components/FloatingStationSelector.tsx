import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import type { SelectionOption } from './SelectionModal';

export function FloatingStationSelector({
  value,
  open,
  options,
  onToggle,
  onSelect,
  onLocate,
}: {
  value: string;
  open: boolean;
  options: SelectionOption[];
  onToggle: () => void;
  onSelect: (value: string) => void;
  onLocate: () => void;
}) {
  return (
    <View style={styles.selectorFloat}>
      <View style={[styles.selectorBox, open && styles.selectorBoxOpen]}>
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
      </View>
      {open ? (
        <View style={styles.popup}>
          <View style={styles.popupSurface}>
            <ScrollView
              style={styles.popupScroll}
              contentContainerStyle={styles.popupContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  style={styles.popupOption}
                  onPress={() => {
                    onSelect(option.value);
                  }}
                >
                  <Text style={styles.popupOptionLabel}>{option.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  selectorFloat: {
    position: 'relative',
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
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  selectorBoxOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
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
  popup: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: -10,
    borderRadius: 16,
    shadowColor: '#7f8aa3',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 30 },
    elevation: 14,
    zIndex: 40,
    maxHeight: 280,
    overflow: 'visible',
  },
  popupSurface: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: 'hidden',
  },
  popupScroll: {
    maxHeight: 280,
  },
  popupContent: {
    paddingVertical: 8,
  },
  popupOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  popupOptionLabel: {
    color: '#21463e',
    fontSize: 16,
  },
});
