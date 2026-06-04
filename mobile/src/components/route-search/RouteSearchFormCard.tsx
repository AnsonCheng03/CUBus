import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { AutocompleteField } from '../AutocompleteField';

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
  t: (value: string) => string;
}) {
  return (
    <View style={styles.selectorFloat}>
      <View style={styles.formCard}>
        <View style={styles.locationBlock}>
          <AutocompleteField
            label={t('Form-Start')}
            value={startValue}
            onChange={onChangeStart}
            options={options}
            placeholder={t('input-text-reminder')}
          />
        </View>
        <Pressable style={styles.locationAction} onPress={onUseNearbyStart}>
          <Text style={styles.locationActionText}>{t('DescTxt-yrloc')}</Text>
        </Pressable>

        <View style={styles.locationBlock}>
          <AutocompleteField
            label={t('Form-Dest')}
            value={destValue}
            onChange={onChangeDest}
            options={options}
            placeholder={t('input-text-reminder')}
          />
        </View>
        <Pressable style={[styles.locationAction, styles.locationActionNoBorder]} onPress={onUseNearbyDest}>
          <Text style={styles.locationActionText}>{t('DescTxt-yrloc')}</Text>
        </Pressable>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{t('info-deptnow')}</Text>
          <Switch value={departNow} onValueChange={onToggleDepartNow} trackColor={{ true: '#630a10' }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  selectorFloat: {
    position: 'relative',
    zIndex: 1,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: '2%',
    paddingVertical: 8,
    shadowColor: '#a6adc9',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  locationBlock: {
    paddingVertical: 4,
  },
  locationAction: {
    paddingHorizontal: 50,
    paddingTop: 0,
    paddingBottom: 10,
  },
  locationActionNoBorder: {
    paddingBottom: 8,
  },
  locationActionText: {
    color: '#630a10',
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e3e3e3',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginTop: 8,
  },
  toggleLabel: {
    color: '#111',
    fontWeight: '700',
  },
});
