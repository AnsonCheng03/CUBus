import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '../components/ScreenContainer';
import { SelectionModal, type SelectionOption } from '../components/SelectionModal';
import { RouteMapModal } from '../components/RouteMapModal';
import { useAppState } from '../providers/AppProvider';
import type { BusData } from '../../../src/shared-core/realtime/getRealTime';
import type { RouteMapSelection } from '../../../src/shared-core/app/types';
import { generateRouteResult } from '../../../src/shared-core/realtime/getRealTime';
import { nativeApiClient } from '../lib/nativeApi';
import { getNearestStation } from '../lib/location';

export function RealtimeScreen() {
  const { t, i18n } = useTranslation('global');
  const insets = useSafeAreaInsets();
  const { appData, appTempData, setAppTempData, realtimeData, networkError, refreshRealtime } = useAppState();
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
    () => Object.keys((appData.GPS as Record<string, any>) ?? {}).filter((key) => appData.GPS?.[key]?.ImportantStation !== null),
    [appData.GPS],
  );

  const stationOptions: SelectionOption[] = allBusStop.map((stop) => ({
    label: t(stop),
    value: stop,
  }));

  const groupedNearbyStops = useMemo(
    () => ((appData.GPS as Record<string, any>)?.[selectedStation]?.Grouped as string[] | undefined) ?? [],
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
    <ScreenContainer
      title={t('title_realtime')}
      subtitle={t('meta_desc_realtime')}
      showHeader={false}
      contentPadding={0}
      contentGap={0}
      contentStyle={styles.pageContent}
      scrollStyle={styles.scroll}
      safeAreaBackgroundColor="#911f27"
      safeAreaEdges={[]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f766e" />}
    >
      <RouteMapModal routeMap={routeMap} onClose={() => setRouteMap(null)} />
      <SelectionModal
        title={t('DescTxt-yrloc')}
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={setSelectedStation}
        options={stationOptions}
        searchable
      />

      <View style={[styles.redHeader, { paddingTop: insets.top + 15 }]}>
        <View style={styles.selectorFloat}>
          <View style={styles.selectorBox}>
            <View style={styles.selectorIcon}>
              <Ionicons name="bus-outline" size={22} color="#111" />
            </View>
            <Pressable style={styles.selectorButton} onPress={() => setPickerVisible(true)}>
              <Text style={styles.selectorValue} numberOfLines={1}>
                {t(selectedStation)}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </Pressable>
            <Pressable
              style={styles.gpsButton}
              onPress={() => {
                getNearestStation(t, (appData.GPS as Record<string, any>) ?? {})
                  .then((result) => {
                    const candidate = result?.[0]?.[0];
                    if (candidate && !result?.[0]?.[1]?.error) setSelectedStation(candidate);
                  })
                  .catch(() => {});
              }}
            >
              <Ionicons name="navigate" size={20} color="#111" />
            </Pressable>
          </View>
        </View>
      </View>
      <View style={styles.resultsSection}>
        {networkError.realtime ? <Text style={styles.warning}>{t('internet_offline')}</Text> : null}
        {fetchError ? <Text style={styles.warning}>{t('fetch-error')}</Text> : null}

        {groupedNearbyStops.length > 0 ? (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              {t('DescTxt-yrloc')}：
              {groupedNearbyStops.map((group, index) => (
                <Text key={group} style={styles.infoLink} onPress={() => setSelectedStation(group)}>
                  {`${t(group)}${index !== groupedNearbyStops.length - 1 ? ', ' : ''}`}
                </Text>
              ))}
            </Text>
          </View>
        ) : null}

        {realtimeResult.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyTitle}>{t('No-bus-time')}</Text>
          </View>
        ) : (
          realtimeResult.map((bus, index) => (
            <Pressable
              key={`${bus.busno}-${bus.time}-${index}`}
              style={[styles.busRow, bus.arrived && styles.busRowArrived]}
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
            >
              <View style={styles.busLeft}>
                <View style={[styles.busBadge, { backgroundColor: bus.config?.colorCode || '#f6d365' }]}>
                  <Text style={styles.busBadgeText}>{bus.busno}</Text>
                </View>
                {bus.direction ? (
                  <Text style={styles.directionText}>{bus.direction === 'DOWNST' ? '↓' : '↑'}</Text>
                ) : null}
              </View>

              <View style={styles.nextStationDisplay}>
                <Text style={styles.nextStationLabel}>
                  {bus.nextStation?.importantStationAfter?.[0] ? t('next-important-station') : t('next-station')}
                </Text>
                <Text style={styles.nextStationValue} numberOfLines={1}>
                  {bus.nextStation?.importantStationAfter?.[0] ?? t(bus.nextStation?.stationName ?? '')}
                </Text>
                {bus.config?.scheduleType === 'reported' ? (
                  <Text style={styles.infoText}>
                    {(bus.config?.scheduleConfig?.count ?? 1) + ' ' + t('bus-reported-by-user')}
                  </Text>
                ) : bus.warning ? (
                  <Text style={styles.warningText}>{t(bus.warning)}</Text>
                ) : null}
              </View>

              <Text style={styles.arrivalTime}>{bus.time}</Text>
            </Pressable>
          ))
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#911f27',
  },
  pageContent: {
    paddingBottom: 90,
    backgroundColor: '#911f27',
  },
  redHeader: {
    backgroundColor: '#911f27',
    paddingHorizontal: '3%',
    paddingBottom: 35,
  },
  selectorFloat: {
    marginBottom: -20,
  },
  selectorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: '2%',
    shadowColor: '#a6adc9',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
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
  gpsButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsSection: {
    backgroundColor: '#fff',
    paddingTop: 28,
    paddingBottom: 16,
    minHeight: 500,
  },
  warning: {
    color: '#6f5200',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  infoBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#ddd',
    borderRadius: 5,
    padding: 10,
  },
  infoBannerText: {
    color: '#333',
    lineHeight: 20,
  },
  infoLink: {
    color: '#630a10',
  },
  emptyRow: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyTitle: {
    color: '#333',
    fontSize: 16,
  },
  busRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: '7%',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    minHeight: 65,
    gap: 18,
  },
  busRowArrived: {
    opacity: 0.5,
  },
  busLeft: {
    width: 50,
    alignItems: 'center',
  },
  busBadge: {
    width: 38,
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  busBadgeText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 14,
  },
  directionText: {
    marginTop: 4,
    fontSize: 16,
    color: '#333',
  },
  nextStationDisplay: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 10,
  },
  nextStationLabel: {
    width: 27,
    fontSize: 12,
    color: '#333',
    textAlign: 'right',
  },
  nextStationValue: {
    flex: 1,
    color: '#111',
    fontSize: 19,
  },
  infoText: {
    marginLeft: 37,
    color: '#2196f3',
    fontSize: 11,
    width: '100%',
  },
  warningText: {
    marginLeft: 37,
    color: 'red',
    fontSize: 11,
    width: '100%',
  },
  arrivalTime: {
    width: 80,
    textAlign: 'right',
    fontSize: 24,
    color: '#111',
  },
});
