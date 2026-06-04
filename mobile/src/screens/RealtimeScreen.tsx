import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FloatingStationSelector } from '../components/FloatingStationSelector';
import { InlineNoticeRow } from '../components/InlineNoticeRow';
import { RealtimeBusRow } from '../components/RealtimeBusRow';
import { SelectionModal, type SelectionOption } from '../components/SelectionModal';
import { RouteMapModal } from '../components/RouteMapModal';
import { useAppState } from '../providers/AppProvider';
import type { BusData } from '../../../src/shared-core/realtime/getRealTime';
import type { RouteMapSelection } from '../../../src/shared-core/app/types';
import { generateRouteResult } from '../../../src/shared-core/realtime/getRealTime';
import { nativeApiClient } from '../lib/nativeApi';
import { getNearestStation } from '../lib/location';
import { NAV_RESPONSIVE_BREAKPOINT } from '../lib/layout';

export function RealtimeScreen() {
  const { t, i18n } = useTranslation('global');
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= NAV_RESPONSIVE_BREAKPOINT;
  const { appData, appTempData, setAppTempData, realtimeData, networkError, refreshRealtime } =
    useAppState();
  const [selectedStation, setSelectedStation] = useState(appTempData.realTimeStation ?? 'MTR');
  const [realtimeResult, setRealtimeResult] = useState<any[]>([]);
  const [routeMap, setRouteMap] = useState<RouteMapSelection | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const allBusStop = useMemo(() => {
    try {
      const stops = Object.values(appData?.bus as BusData).flatMap((busData) =>
        busData.stations?.name.filter((stop) => stop !== undefined),
      );
      return Array.from(new Set(stops.filter((stop): stop is string => stop !== undefined))).sort();
    } catch {
      return [] as string[];
    }
  }, [appData?.bus]);

  const importantStations = useMemo(
    () =>
      Object.keys((appData.GPS as Record<string, any>) ?? {}).filter(
        (key) => appData.GPS?.[key]?.ImportantStation !== null,
      ),
    [appData.GPS],
  );

  const stationOptions: SelectionOption[] = allBusStop.map((stop) => ({
    label: t(stop),
    value: stop,
  }));

  const groupedNearbyStops = useMemo(
    () =>
      ((appData.GPS as Record<string, any>)?.[selectedStation]?.Grouped as string[] | undefined) ??
      [],
    [appData.GPS, selectedStation],
  );

  const refreshResults = async (stationName = selectedStation, shouldLog = false) => {
    await generateRouteResult(
      t,
      (appData?.bus ?? {}) as BusData,
      appData,
      realtimeData,
      stationName,
      setRealtimeResult,
      importantStations,
      true,
      setFetchError,
    );

    if (shouldLog) {
      nativeApiClient
        .logRealtime({ dest: stationName, lang: i18n.language, token: appData.token ?? '' })
        .catch(() => {});
    }
  };

  useEffect(() => {
    setAppTempData('realTimeStation', selectedStation);
    refreshResults(selectedStation, true).catch(() => {});
  }, [selectedStation]);

  useEffect(() => {
    refreshResults(selectedStation).catch(() => {});
  }, [realtimeData]);

  useEffect(() => {
    if (appTempData.realTimeStation) {
      setSelectedStation(appTempData.realTimeStation);
      return;
    }

    getNearestStation(t, (appData.GPS as Record<string, any>) ?? {})
      .then((result) => {
        const candidate = result?.[0]?.[0];
        if (candidate && !result?.[0]?.[1]?.error) {
          setSelectedStation(candidate);
        }
      })
      .catch(() => {});
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRealtime();
    await refreshResults(selectedStation);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <RouteMapModal routeMap={routeMap} onClose={() => setRouteMap(null)} />
      <SelectionModal
        title={t('DescTxt-yrloc')}
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={setSelectedStation}
        options={stationOptions}
        searchable
      />
      <View style={[styles.redHeader, { paddingTop: (isLargeScreen ? 0 : insets.top) + 15 }]}>
        <View style={styles.redHeaderBackdrop} />
        <FloatingStationSelector
          value={t(selectedStation)}
          onOpen={() => setPickerVisible(true)}
          onLocate={() => {
            getNearestStation(t, (appData.GPS as Record<string, any>) ?? {})
              .then((result) => {
                const candidate = result?.[0]?.[0];
                if (candidate && !result?.[0]?.[1]?.error) setSelectedStation(candidate);
              })
              .catch(() => {});
          }}
        />
      </View>
      <View style={styles.resultsShell}>
        <ScrollView
          style={styles.resultsScroll}
          contentContainerStyle={[styles.resultsContent]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f766e" />
          }
        >
          {networkError.realtime ? (
            <InlineNoticeRow text={t('internet_offline')} variant="alert" />
          ) : null}
          {fetchError ? <InlineNoticeRow text={t('fetch-error')} variant="alert" /> : null}

          {groupedNearbyStops.length > 0 ? (
            <InlineNoticeRow variant="info">
              <Text style={styles.infoBannerText}>
                {t('DescTxt-yrloc')}：
                {groupedNearbyStops.map((group, index) => (
                  <Text
                    key={group}
                    style={styles.infoLink}
                    onPress={() => setSelectedStation(group)}
                  >
                    {`${t(group)}${index !== groupedNearbyStops.length - 1 ? ', ' : ''}`}
                  </Text>
                ))}
              </Text>
            </InlineNoticeRow>
          ) : null}

          {realtimeResult.length === 0 ? (
            <InlineNoticeRow text={t('No-bus-time')} variant="alert" />
          ) : (
            realtimeResult.map((bus, index) => (
              <RealtimeBusRow
                key={`${bus.busno}-${bus.time}-${index}`}
                bus={bus}
                t={t}
                showTopBorder={!(index === 0 && (networkError.realtime || fetchError || groupedNearbyStops.length > 0))}
                onPress={() => {
                  if (!bus.nextStation) return;
                  setRouteMap({
                    route: bus.nextStation.route,
                    currentIndex: bus.nextStation.startIndex,
                    details: {
                      busNo: bus.busno,
                      stationIndex: bus.nextStation.startIndex,
                      token: appData.token,
                    },
                  });
                }}
              />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
  resultsShell: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resultsScroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resultsContent: {
    flexGrow: 0,
  },
  infoBannerText: {
    color: '#333',
    lineHeight: 20,
  },
  infoLink: {
    color: '#630a10',
  },
});
