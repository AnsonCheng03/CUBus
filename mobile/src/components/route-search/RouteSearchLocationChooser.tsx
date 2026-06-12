import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { FloatingStationSelector } from '../FloatingStationSelector';
import type { SelectionOption } from '../SelectionModal';

export function RouteSearchLocationChooser({
  value,
  open,
  options,
  placeholder,
  locationIconName,
  showTopBorder = true,
  onChangeText,
  onFocus,
  onBlur,
  onToggle,
  onSelect,
  onUseNearby,
}: {
  value: string;
  open: boolean;
  options: SelectionOption[];
  placeholder: string;
  locationIconName: 'locate-outline' | 'location-outline';
  showTopBorder?: boolean;
  onChangeText: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onToggle: () => void;
  onSelect: (value: string) => void;
  onUseNearby: () => void;
}) {
  return (
    <View style={[styles.locationChooserContainer, open && styles.locationChooserContainerActive]}>
      <View style={styles.locationChooser}>
        <View style={styles.locationIconCell}>
          <Ionicons name={locationIconName} size={24} color="#630a10" />
        </View>
        <View
          style={[
            styles.locationInputContainer,
            !showTopBorder && styles.locationInputContainerFirst,
          ]}
        >
          <View style={[styles.locationInput, open && styles.locationInputActive]}>
            <FloatingStationSelector
              value={value}
              open={open}
              options={options}
              placeholder={placeholder}
              popupHeight={220}
              editable
              leading={false}
              onChangeText={onChangeText}
              onFocus={onFocus}
              onBlur={onBlur}
              onToggle={onToggle}
              onSelect={onSelect}
              showLocateButton={false}
              showChevron={false}
              filterOptions
              boxStyle={styles.inlineSelectorBox}
              iconStyle={styles.inlineSelectorIcon}
              buttonStyle={styles.inlineSelectorButton}
              inputStyle={styles.inlineSelectorValue}
            />
          </View>
          <Pressable style={styles.functionButton} onPress={onUseNearby}>
            <Ionicons name="navigate-circle-outline" size={26} color="#630a10" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
