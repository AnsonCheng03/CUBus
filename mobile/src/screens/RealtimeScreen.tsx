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
import { ScreenContainer } from '../components/ScreenContainer';
import { SelectionModal, type SelectionOption } from '../components/SelectionModal';
import { RouteMapModal } from '../components/RouteMapModal';
import { useAppState } from '../providers/AppProvider';
import type { BusData } from '../../../src/shared-core/realtime/getRealTime';
import { generateRouteResult } from '../../../src/shared-core/realtime/getRealTime';
import { nativeApiClient } from '../lib/nativeApi';
import { getNearestStation } from '../lib/location';

export function RealtimeScreen() {
  const { t, i18n } = useTranslation('global');
  const { appData, appTempData, setAppTempData, realtimeData, networkError, refreshRealtime } = useAppState();
  const [selectedStation, setSelectedStation] = useState(appTempData.realTimeStation ?? 'MTR');
  const [realtimeResult, setRealtimeResult] = useState<any[]>([]);
  const [routeMap, setRouteMap] = useState<any[]>([]);
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f766e" />}
    >
      <RouteMapModal routeMap={routeMap} onClose={() => setRouteMap([])} />
      <SelectionModal
        title={t('DescTxt-yrloc')}
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={setSelectedStation}
        options={stationOptions}
        searchable
      />

      <View style={styles.controls}>
        <Pressable style={styles.stationButton} onPress={() => setPickerVisible(true)}>
          <View>
            <Text style={styles.controlLabel}>{t('DescTxt-yrloc')}</Text>
            <Text style={styles.stationValue}>{t(selectedStation)}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#0f766e" />
        </Pressable>
        <Pressable
          style={styles.nearbyButton}
          onPress={() => {
            getNearestStation(t, (appData.GPS as Record<string, any>) ?? {})
              .then((result) => {
                const candidate = result?.[0]?.[0];
                if (candidate && !result?.[0]?.[1]?.error) setSelectedStation(candidate);
              })
              .catch(() => {});
          }}
        >
          <Ionicons name="navigate" size={18} color="#fff" />
          <Text style={styles.nearbyButtonText}>{t('Btn-Map')}</Text>
        </Pressable>
      </View>

      {networkError.realtime ? <Text style={styles.warning}>{t('internet_offline')}</Text> : null}
      {fetchError ? <Text style={styles.warning}>{t('fetch-error')}</Text> : null}

      {realtimeResult.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{t('No-bus-time')}</Text>
        </View>
      ) : (
        realtimeResult.map((bus, index) => (
          <Pressable
            key={`${bus.busno}-${bus.time}-${index}`}
            style={[styles.busCard, bus.arrived && styles.busCardArrived]}
            onPress={() => {
              if (!bus.nextStation) return;
              setRouteMap([
                bus.nextStation.route,
                bus.nextStation.startIndex,
                {
                  busNo: bus.busno,
                  stationIndex: bus.nextStation.startIndex,
                  token: appData.token,
                },
              ]);
            }}
          >
            <View style={styles.busTopRow}>
              <View style={[styles.busBadge, { backgroundColor: bus.config?.colorCode || '#f6d365' }]}>
                <Text style={styles.busBadgeText}>{bus.busno}</Text>
              </View>
              <Text style={styles.arrivalTime}>{bus.time}</Text>
            </View>
            <Text style={styles.nextStationLabel}>{t('next-station')}</Text>
            <Text style={styles.nextStationValue}>
              {bus.nextStation?.importantStationAfter?.[0] ?? t(bus.nextStation?.stationName ?? '')}
            </Text>
            <Text style={styles.routeHint}>{bus.direction || t('mode-realtime')}</Text>
            {bus.config?.scheduleType === 'reported' ? (
              <Text style={styles.infoText}>
                {(bus.config?.scheduleConfig?.count ?? 1) + ' ' + t('bus-reported-by-user')}
              </Text>
            ) : bus.warning ? (
              <Text style={styles.infoText}>{t(bus.warning)}</Text>
            ) : null}
          </Pressable>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  stationButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fffdf8',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ded5c4',
  },
  controlLabel: {
    color: '#5b6f68',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stationValue: {
    color: '#173f35',
    fontSize: 18,
    fontWeight: '800',
  },
  nearbyButton: {
    backgroundColor: '#0f766e',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  nearbyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  warning: {
    backgroundColor: '#fff7d6',
    color: '#6f5200',
    padding: 12,
    borderRadius: 14,
  },
  emptyCard: {
    backgroundColor: '#fffdf8',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd5c4',
  },
  emptyTitle: {
    color: '#173f35',
    fontSize: 16,
    fontWeight: '700',
  },
  busCard: {
    backgroundColor: '#fffdf8',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd5c4',
    gap: 8,
  },
  busCardArrived: {
    opacity: 0.72,
  },
  busTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  busBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  busBadgeText: {
    color: '#173f35',
    fontWeight: '800',
    fontSize: 16,
  },
  arrivalTime: {
    fontSize: 28,
    fontWeight: '800',
    color: '#173f35',
  },
  nextStationLabel: {
    color: '#5b6f68',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nextStationValue: {
    color: '#173f35',
    fontSize: 20,
    fontWeight: '800',
  },
  routeHint: {
    color: '#48655d',
  },
  infoText: {
    color: '#7d5b00',
    lineHeight: 20,
  },
});
