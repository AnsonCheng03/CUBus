import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const busIcon = require('../../../src/assets/bus.png');
const gpsIcon = require('../../../src/assets/GPS.jpg');

export function FloatingStationSelector({
  value,
  onOpen,
  onLocate,
}: {
  value: string;
  onOpen: () => void;
  onLocate: () => void;
}) {
  return (
    <View style={styles.selectorFloat}>
      <View style={styles.selectorBox}>
        <View style={styles.selectorIcon}>
          <Image source={busIcon} style={styles.selectorImage} resizeMode="contain" />
        </View>
        <Pressable style={styles.selectorButton} onPress={onOpen}>
          <Text style={styles.selectorValue} numberOfLines={1}>
            {value}
          </Text>
          <Text style={styles.chevron}>▼</Text>
        </Pressable>
        <Pressable style={styles.gpsButton} onPress={onLocate}>
          <Image source={gpsIcon} style={styles.gpsImage} resizeMode="contain" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  selectorFloat: {
    position: 'relative',
    zIndex: 1,
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
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  selectorIcon: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorImage: {
    width: 24,
    height: 24,
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
    color: '#666',
    fontSize: 14,
    marginRight: 2,
  },
  gpsButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsImage: {
    width: 23,
    height: 23,
    borderRadius: 12,
  },
});
