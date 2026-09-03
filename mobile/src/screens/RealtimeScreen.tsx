import React, { useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { RealtimeRow, RouteMapSelection } from '../shared-core/app/types';
import type { Coordinates } from '../shared-core/location/nearestStations';
import { generateRouteResult } from '../shared-core/realtime/getRealTime';
import { RealtimeHeader } from '../components/realtime/RealtimeHeader';
import { RealtimeResultsList } from '../components/realtime/RealtimeResultsList';
import { RouteMapModal } from '../components/RouteMapModal';
import { AppStatusScreen } from '../components/AppStatusScreen';
import { MOBILE_BOTTOM_NAV_OVERLAP } from '../components/CustomNavBar';
import { resolveNearestStationCodeFromCoordinates } from '../hooks/useNearestStation';
import { getCurrentCoordinates } from '../lib/location';
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

  const [selectedStation, setSelectedStation] = useState<string | null>(
    appTempData.realTimeStation ?? 'MTR',
  );
  const [realtimeResult, setRealtimeResult] = useState<RealtimeRow[]>([]);
  const [routeMapVisible, setRouteMapVisible] = useState<RouteMapSelection | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [gpsErrorText, setGpsErrorText] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { stationOptions, groupedNearbyStops, importantStations } = useRealtimeStationOptions(
    appData,
    selectedStation ?? '',
    currentCoords,
    t,
    i18n.language,
  );

  const refreshResults = async (stationName = selectedStation, shouldLog = false) => {
    if (!stationName) {
      return;
    }

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
    setGpsErrorText(null);
    setSelectedStation(stationName);
    setRealtimeStation(stationName);
    await refreshResults(stationName, shouldLog);
  };

  const refreshCurrentCoords = async () => {
    const coords = await getCurrentCoordinates(t);
    setCurrentCoords(coords);
    return coords;
  };

  const selectNearestStation = async () => {
    console.log('[gps] realtime locate button pressed');
    setGpsErrorText(null);
    const nearestStation = await refreshCurrentCoords()
      .then((coords) => {
        return resolveNearestStationCodeFromCoordinates(t, appData.GPS ?? {}, coords);
      })
      .catch((error: unknown) => {
        console.error('[gps] realtime locate failed', error);
        setGpsErrorText(error instanceof Error ? error.message : t('GPS-error'));
        return null;
      });

    if (nearestStation) {
      console.log('[gps] realtime locate resolved station', { nearestStation });
      await selectStation(nearestStation);
      return;
    }

    console.warn('[gps] realtime locate returned no nearest station');
    setGpsErrorText((current) => current ?? t('GPS-error'));
  };

  useEffect(() => {
    if (appTempData.realTimeStation) {
      selectStation(appTempData.realTimeStation).catch(() => {});
      return;
    }

    refreshCurrentCoords()
      .then((coords) => {
        const candidate = resolveNearestStationCodeFromCoordinates(t, appData.GPS ?? {}, coords);
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
    if (gpsErrorText !== t('nearst_error')) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setGpsErrorText((current) => (current === t('nearst_error') ? null : current));
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [gpsErrorText, t]);

  useEffect(() => {
    if (!selectedStation) {
      return;
    }

    refreshResults(selectedStation).catch(() => {});
  }, [realtimeData, selectedStation]);

  useEffect(() => {
    if (!selectedStation) {
      return;
    }

    refreshResults(selectedStation).catch(() => {});
  }, [i18n.language, selectedStation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRealtime();
    await refreshResults(selectedStation);
    setRefreshing(false);
  };

  const openRouteMapForRow = (row: RealtimeRow) => {
    const selection = createRealtimeRouteMapSelection(row, appData.token);

    if (!selection || selection.route.length === 0) {
      console.warn('[route-map] unable to open route map for realtime row', {
        busNo: row.busno,
        hasNextStation: Boolean(row.nextStation),
        routeLength: row.nextStation?.route?.length ?? 0,
      });
      return;
    }

    console.log('[route-map] opening realtime route map', {
      busNo: row.busno,
      routeLength: selection.route.length,
      currentIndex: selection.currentIndex,
    });
    setRouteMapVisible(selection);
  };

  if (!selectedStation) {
    return (
      <AppStatusScreen
        title="CU Bus"
        hint={t('DownloadFiles-Initializing', { ns: 'preset' })}
        loading
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <RouteMapModal routeMap={routeMapVisible} onClose={() => setRouteMapVisible(null)} />

      <RealtimeHeader
        paddingTop={isLargeScreen ? 0 : 10 + insets.top}
        stationLabel={t(selectedStation)}
        pickerOpen={pickerVisible}
        stationOptions={stationOptions}
        onTogglePicker={() => {
          setPickerVisible((value) => {
            const nextValue = !value;
            if (nextValue) {
              refreshCurrentCoords().catch(() => {});
            }
            return nextValue;
          });
        }}
        onSelectStation={(value) => {
          setPickerVisible(false);
          selectStation(value).catch(() => {});
        }}
        onLocate={() => {
          setPickerVisible(false);
          selectNearestStation().catch(() => {});
        }}
      />
      <View style={styles.resultsShell}>
        <RealtimeResultsList
          rows={realtimeResult}
          networkError={networkError.realtime}
          fetchError={fetchError}
          gpsErrorText={gpsErrorText}
          groupedNearbyStops={groupedNearbyStops}
          onSelectGroupedStop={(value) => {
            selectStation(value, false).catch(() => {});
          }}
          onSelectRow={openRouteMapForRow}
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
