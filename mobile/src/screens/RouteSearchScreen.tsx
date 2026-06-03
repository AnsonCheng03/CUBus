import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../components/ScreenContainer';
import { AutocompleteField } from '../components/AutocompleteField';
import { RouteMapModal } from '../components/RouteMapModal';
import { SelectionModal, type SelectionOption } from '../components/SelectionModal';
import { getNearestStation } from '../lib/location';
import { useAppState } from '../providers/AppProvider';
import { useRouteSearchState } from '../hooks/useRouteSearchState';
import { useRouteCompute } from '../hooks/useRouteCompute';

const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const weekdays = ['WK-Mon', 'WK-Tue', 'WK-Wed', 'WK-Thu', 'WK-Fri', 'WK-Sat', 'WK-Sun'];

export function RouteSearchScreen() {
  const { t } = useTranslation('global');
  const { appData, networkError, refreshRealtime } = useAppState();
  const state = useRouteSearchState();
  const { routeResult, routeMap, setRouteMap, fetchError, generate } = useRouteCompute();
  const [refreshing, setRefreshing] = useState(false);
  const [pickerType, setPickerType] = useState<'weekday' | 'date' | 'hour' | 'minute' | null>(null);

  const onSubmit = () =>
    generate({
      routeSearchStart: state.routeSearchStart,
      routeSearchDest: state.routeSearchDest,
      departNow: state.departNow,
      selectWeekday: state.selectWeekday,
      selectDate: state.selectDate,
      selectHour: state.selectHour,
      selectMinute: state.selectMinute,
    });

  useEffect(() => {
    state.persistTemp();
    onSubmit();
  }, [state.routeSearchStart, state.routeSearchDest, state.departNow]);

  const pickerOptions = useMemo<SelectionOption[]>(() => {
    if (pickerType === 'weekday') return weekdays.map((value) => ({ label: value, value }));
    if (pickerType === 'date') return state.travelDateOptions.map((value) => ({ label: value, value }));
    if (pickerType === 'hour') return hours.map((value) => ({ label: value, value }));
    if (pickerType === 'minute') return minutes.map((value) => ({ label: value, value }));
    return [];
  }, [pickerType, state.travelDateOptions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRealtime();
    onSubmit();
    setRefreshing(false);
  };

  return (
    <ScreenContainer
      title={t('title_routesearch')}
      subtitle={t('meta_desc_routesearch')}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f766e" />}
    >
      <RouteMapModal routeMap={routeMap} onClose={() => setRouteMap([])} />
      <SelectionModal
        title={pickerType ? pickerType.toUpperCase() : ''}
        visible={pickerType !== null}
        onClose={() => setPickerType(null)}
        options={pickerOptions}
        onSelect={(value) => {
          if (pickerType === 'weekday') state.setSelectWeekday(value);
          if (pickerType === 'date') state.setSelectDate(value);
          if (pickerType === 'hour') state.setSelectHour(value);
          if (pickerType === 'minute') state.setSelectMinute(value);
        }}
      />

      <View style={styles.formCard}>
        <AutocompleteField
          label={t('Form-Start')}
          value={state.routeSearchStart}
          onChange={state.setRouteSearchStart}
          options={state.translatedBuildings}
          placeholder={t('input-text-reminder')}
        />
        <Pressable
          onPress={() => {
            getNearestStation(t, (appData.GPS as Record<string, any>) ?? {})
              .then((result) => {
                const code = result?.[0]?.[0];
                if (code && !result?.[0]?.[1]?.error) {
                  state.setRouteSearchStart(`${t(code)} (${code.toUpperCase()})`);
                }
              })
              .catch(() => {});
          }}
        >
          <Text style={styles.linkText}>{t('DescTxt-yrloc')}</Text>
        </Pressable>

        <AutocompleteField
          label={t('Form-Dest')}
          value={state.routeSearchDest}
          onChange={state.setRouteSearchDest}
          options={state.translatedBuildings}
          placeholder={t('input-text-reminder')}
        />
        <Pressable
          onPress={() => {
            getNearestStation(t, (appData.GPS as Record<string, any>) ?? {})
              .then((result) => {
                const code = result?.[0]?.[0];
                if (code && !result?.[0]?.[1]?.error) {
                  state.setRouteSearchDest(`${t(code)} (${code.toUpperCase()})`);
                }
              })
              .catch(() => {});
          }}
        >
          <Text style={styles.linkText}>{t('DescTxt-yrloc')}</Text>
        </Pressable>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{t('info-deptnow')}</Text>
          <Switch value={state.departNow} onValueChange={state.setDepartNow} trackColor={{ true: '#0f766e' }} />
        </View>

        {!state.departNow ? (
          <View style={styles.timeGrid}>
            <Pressable style={styles.timeChip} onPress={() => setPickerType('weekday')}>
              <Text style={styles.timeChipLabel}>Weekday</Text>
              <Text style={styles.timeChipValue}>{state.selectWeekday}</Text>
            </Pressable>
            <Pressable style={styles.timeChip} onPress={() => setPickerType('date')}>
              <Text style={styles.timeChipLabel}>Date</Text>
              <Text style={styles.timeChipValue}>{state.selectDate}</Text>
            </Pressable>
            <Pressable style={styles.timeChip} onPress={() => setPickerType('hour')}>
              <Text style={styles.timeChipLabel}>Hour</Text>
              <Text style={styles.timeChipValue}>{state.selectHour}</Text>
            </Pressable>
            <Pressable style={styles.timeChip} onPress={() => setPickerType('minute')}>
              <Text style={styles.timeChipLabel}>Minute</Text>
              <Text style={styles.timeChipValue}>{state.selectMinute}</Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitButtonText}>{t('Btn-Adv')}</Text>
        </Pressable>
      </View>

      {networkError.realtime ? <Text style={styles.warning}>{t('internet_offline')}</Text> : null}
      {fetchError ? <Text style={styles.warning}>{t('fetch-error')}</Text> : null}
      {routeResult.samestation ? <Text style={styles.warning}>{t('samestation-info')}</Text> : null}

      {routeResult.sortedResults ? (
        routeResult.sortedResults.slice(0, 15).map((result: any, index: number) => (
          <Pressable
            key={`${result.busNo}-${result.arrivalTime}-${index}`}
            style={styles.resultCard}
            onPress={() =>
              setRouteMap([
                result.route,
                result.routeIndex,
                { busNo: result.busNo, stationIndex: result.routeIndex, token: appData.token },
              ])
            }
          >
            <View style={styles.resultTopRow}>
              <View style={[styles.resultBadge, { backgroundColor: result.config?.colorCode || '#f3d37c' }]}>
                <Text style={styles.resultBadgeText}>{result.busNo}</Text>
              </View>
              <Text style={styles.resultTime}>{result.outputTime > 1000 ? 'N/A' : `${result.outputTime} min`}</Text>
            </View>
            <Text style={styles.resultRoute}>{result.start}</Text>
            <Text style={styles.resultMeta}>{`${t('next-bus-arrival-info')}: ${result.arrivalTime}`}</Text>
            <Text style={styles.resultMeta}>{`${t('wait-time-desc')}: ${result.waitTime} min`}</Text>
            {result.warning ? <Text style={styles.resultWarning}>{t(result.warning)}</Text> : null}
          </Pressable>
        ))
      ) : routeResult.error ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultRoute}>{t(routeResult.message)}</Text>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: '#fffdf8',
    borderRadius: 22,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#ddd5c4',
  },
  linkText: {
    color: '#0f766e',
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eef5f2',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toggleLabel: {
    color: '#21463e',
    fontWeight: '700',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChip: {
    width: '47%',
    backgroundColor: '#f5f0e3',
    borderRadius: 16,
    padding: 12,
    gap: 4,
  },
  timeChipLabel: {
    color: '#5b6f68',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  timeChipValue: {
    color: '#173f35',
    fontWeight: '800',
  },
  submitButton: {
    backgroundColor: '#0f766e',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  warning: {
    backgroundColor: '#fff7d6',
    color: '#6f5200',
    padding: 12,
    borderRadius: 14,
  },
  resultCard: {
    backgroundColor: '#fffdf8',
    borderRadius: 22,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#ddd5c4',
  },
  resultTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  resultBadgeText: {
    color: '#173f35',
    fontWeight: '800',
  },
  resultTime: {
    color: '#173f35',
    fontWeight: '800',
    fontSize: 24,
  },
  resultRoute: {
    color: '#173f35',
    fontSize: 18,
    fontWeight: '800',
  },
  resultMeta: {
    color: '#50655e',
  },
  resultWarning: {
    color: '#7d5b00',
  },
});
