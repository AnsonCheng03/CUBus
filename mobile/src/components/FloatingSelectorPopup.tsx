import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { SelectionOption } from './SelectionModal';

export function FloatingSelectorPopup({
  open,
  height,
  options,
  onSelect,
}: {
  open: boolean;
  height: number;
  options: SelectionOption[];
  onSelect: (value: string) => void;
}) {
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;

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
            outputRange: [0, height],
          }),
        },
      ]}
    >
      <View style={styles.popupSurface}>
        <ScrollView
          style={[styles.popupScroll, { maxHeight: height }]}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  popup: {
    borderRadius: 16,
    shadowColor: '#7f8aa3',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 30 },
    elevation: 14,
    zIndex: 40,
    overflow: 'hidden',
  },
  popupSurface: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    overflow: 'hidden',
  },
  popupScroll: {},
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
