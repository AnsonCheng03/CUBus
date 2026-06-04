import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RouteMapSelection } from '../../../src/shared-core/app/types';
import { RouteMapModal } from '../components/RouteMapModal';
import { SelectionModal, type SelectionOption } from '../components/SelectionModal';
import { RouteSearchFormCard } from '../components/route-search/RouteSearchFormCard';
import { RouteSearchResultsList } from '../components/route-search/RouteSearchResultsList';
import { RouteSearchTimeGrid } from '../components/route-search/RouteSearchTimeGrid';
import { ScreenContainer } from '../components/ScreenContainer';
import { MOBILE_BOTTOM_NAV_OVERLAP } from '../components/CustomNavBar';
import { useNearestStation, formatTranslatedStationLabel } from '../hooks/useNearestStation';
import { useRouteCompute } from '../hooks/useRouteCompute';
import { createRouteSearchRouteMapSelection } from '../hooks/useRouteMapSelection';
import { useRouteSearchState } from '../hooks/useRouteSearchState';
import { NAV_RESPONSIVE_BREAKPOINT } from '../lib/layout';
import type { RouteSearchPickerType } from '../types/mobile';
import { useAppState } from '../providers/AppProvider';

const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const weekdays = ['WK-Mon', 'WK-Tue', 'WK-Wed', 'WK-Thu', 'WK-Fri', 'WK-Sat', 'WK-Sun'];

export function RouteSearchScreen() {
  const { t } = useTranslation('global');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= NAV_RESPONSIVE_BREAKPOINT;
  const { appData, networkError, refreshRealtime } = useAppState();
  const state = useRouteSearchState();
  const { routeResult, routeMap, setRouteMap, fetchError, generate } = useRouteCompute();
  const [refreshing, setRefreshing] = useState(false);
  const [pickerType, setPickerType] = useState<RouteSearchPickerType | null>(null);
  const resolveNearestStation = useNearestStation(t, appData.GPS ?? {});

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

  const applyNearestTo = async (field: 'start' | 'dest') => {
    const nearestStation = await resolveNearestStation().catch(() => null);
    if (!nearestStation) {
      return;
    }

    const nextValue = formatTranslatedStationLabel(t, nearestStation);
    if (field === 'start') {
      state.setRouteSearchStart(nextValue);
      return;
    }

    state.setRouteSearchDest(nextValue);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRealtime();
    await onSubmit();
    setRefreshing(false);
  };

  const routeMapSelection: RouteMapSelection | null = routeMap;
  const routeError = routeResult ? ('error' in routeResult ? routeResult : null) : null;
  const routeSuccess = routeResult ? ('sortedResults' in routeResult ? routeResult : null) : null;

  return (
    <ScreenContainer
      title={t('title_routesearch')}
      subtitle={t('meta_desc_routesearch')}
      showHeader={false}
      contentPadding={0}
      contentGap={0}
      contentStyle={[
        styles.pageContent,
        !isLargeScreen && { paddingBottom: 24 + MOBILE_BOTTOM_NAV_OVERLAP },
      ]}
      scrollStyle={styles.scroll}
      safeAreaBackgroundColor="#911f27"
      safeAreaEdges={[]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f766e" />
      }
    >
      <RouteMapModal routeMap={routeMapSelection} onClose={() => setRouteMap(null)} />
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

      <View style={[styles.redHeader, { paddingTop: (isLargeScreen ? 0 : insets.top) + 15 }]}>
        <View style={styles.redHeaderBackdrop} />
        <RouteSearchFormCard
          startValue={state.routeSearchStart}
          destValue={state.routeSearchDest}
          options={state.translatedBuildings}
          onChangeStart={state.setRouteSearchStart}
          onChangeDest={state.setRouteSearchDest}
          onUseNearbyStart={() => {
            applyNearestTo('start').catch(() => {});
          }}
          onUseNearbyDest={() => {
            applyNearestTo('dest').catch(() => {});
          }}
          departNow={state.departNow}
          onToggleDepartNow={state.setDepartNow}
          t={t}
        />
      </View>

      <View style={styles.resultsSection}>
        {!state.departNow ? (
          <RouteSearchTimeGrid
            values={{
              weekday: state.selectWeekday,
              date: state.selectDate,
              hour: state.selectHour,
              minute: state.selectMinute,
            }}
            onSelect={setPickerType}
          />
        ) : null}

        <Pressable style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitButtonText}>{t('Btn-Adv')}</Text>
        </Pressable>

        <RouteSearchResultsList
          results={routeSuccess?.sortedResults}
          routeError={routeError?.error}
          routeMessage={routeError?.message}
          fetchError={fetchError}
          networkError={networkError.realtime}
          sameStation={routeSuccess?.samestation ?? false}
          onSelect={(result) => {
            setRouteMap(createRouteSearchRouteMapSelection(result, appData.token));
          }}
          t={t}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#911f27',
  },
  pageContent: {
    paddingBottom: 24,
    backgroundColor: '#911f27',
  },
  redHeader: {
    position: 'relative',
    paddingHorizontal: '3%',
    paddingBottom: 15,
  },
  redHeaderBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 35,
    backgroundColor: '#911f27',
  },
  resultsSection: {
    gap: 12,
    paddingHorizontal: 16,
  },
  submitButton: {
    backgroundColor: '#630a10',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
