import React, { useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { RealtimeRow, RouteMapSelection } from '../../../src/shared-core/app/types';
import { generateRouteResult } from '../../../src/shared-core/realtime/getRealTime';
import { RealtimeHeader } from '../components/realtime/RealtimeHeader';
import { RealtimeResultsList } from '../components/realtime/RealtimeResultsList';
import { RouteMapModal } from '../components/RouteMapModal';
import { SelectionModal } from '../components/SelectionModal';
import { MOBILE_BOTTOM_NAV_OVERLAP } from '../components/CustomNavBar';
import { useNearestStation } from '../hooks/useNearestStation';
import { createRealtimeRouteMapSelection } from '../hooks/useRouteMapSelection';
import { useRealtimeStationOptions } from '../hooks/useRealtimeStationOptions';
import { useAppState } from '../providers/AppProvider';
import { useLogRealtimeMutation } from '../query/hooks';
import { NAV_RESPONSIVE_BREAKPOINT } from '../lib/layout';

export function RealtimeScreen() {
  const { t, i18n } = useTranslation('global');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= NAV_RESPONSIVE_BREAKPOINT;
  const { appData, appTempData, setRealtimeStation, realtimeData, networkError, refreshRealtime } =
    useAppState();
  const logRealtimeMutation = useLogRealtimeMutation();

  const [selectedStation, setSelectedStation] = useState(appTempData.realTimeStation ?? 'MTR');
  const [realtimeResult, setRealtimeResult] = useState<RealtimeRow[]>([]);
  const [routeMapVisible, setRouteMapVisible] = useState<RouteMapSelection | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const resolveNearestStation = useNearestStation(t, appData.GPS ?? {});
  const { stationOptions, groupedNearbyStops, importantStations } = useRealtimeStationOptions(
    appData,
    selectedStation,
    t,
  );

  const refreshResults = async (stationName = selectedStation, shouldLog = false) => {
    await generateRouteResult(
      t,
      appData.bus ?? {},
      appData,
      realtimeData,
      stationName,
      setRealtimeResult,
      importantStations,
      true,
      setFetchError,
    );

    if (shouldLog) {
      logRealtimeMutation.mutate({
        dest: stationName,
        lang: i18n.language,
        token: appData.token ?? '',
      });
    }
  };

  const selectStation = async (stationName: string, shouldLog = true) => {
    setSelectedStation(stationName);
    setRealtimeStation(stationName);
    await refreshResults(stationName, shouldLog);
  };

  const selectNearestStation = async () => {
    const nearestStation = await resolveNearestStation().catch(() => null);
    if (nearestStation) {
      await selectStation(nearestStation);
    }
  };

  useEffect(() => {
    if (appTempData.realTimeStation) {
      selectStation(appTempData.realTimeStation).catch(() => {});
      return;
    }

    resolveNearestStation()
      .then((candidate) => {
        if (candidate) {
          return selectStation(candidate);
        }

        return selectStation('MTR');
      })
      .catch(() => {
        selectStation('MTR').catch(() => {});
      });
  }, []);

  useEffect(() => {
    refreshResults(selectedStation).catch(() => {});
  }, [realtimeData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRealtime();
    await refreshResults(selectedStation);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <RouteMapModal routeMap={routeMapVisible} onClose={() => setRouteMapVisible(null)} />
      <SelectionModal
        title={t('DescTxt-yrloc')}
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={(value) => {
          selectStation(value).catch(() => {});
        }}
        options={stationOptions}
        searchable
      />

      <RealtimeHeader
        paddingTop={isLargeScreen ? 0 : insets.top}
        stationLabel={t(selectedStation)}
        onOpen={() => setPickerVisible(true)}
        onLocate={() => {
          selectNearestStation().catch(() => {});
        }}
      />
      <View style={styles.resultsShell}>
        <RealtimeResultsList
          rows={realtimeResult}
          networkError={networkError.realtime}
          fetchError={fetchError}
          groupedNearbyStops={groupedNearbyStops}
          onSelectGroupedStop={(value) => {
            selectStation(value, false).catch(() => {});
          }}
          onSelectRow={(row) => {
            setRouteMapVisible(createRealtimeRouteMapSelection(row, appData.token));
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f766e" />
          }
          contentBottomPadding={isLargeScreen ? 0 : MOBILE_BOTTOM_NAV_OVERLAP}
          t={t}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#911f27',
  },
  resultsShell: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
