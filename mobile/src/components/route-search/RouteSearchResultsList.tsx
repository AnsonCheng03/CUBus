import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { InlineNoticeRow } from '../InlineNoticeRow';
import { RouteBusIcon } from '../RouteBusIcon';
import type { RouteSearchResultCard } from '../../types/mobile';
import { e2eProps } from '../../test-support/e2eProps';

export function RouteSearchResultsList({
  results,
  routeError,
  routeMessage,
  fetchError,
  gpsErrorText,
  networkError,
  sameStation,
  onSelect,
  t,
}: {
  results: RouteSearchResultCard[] | null | undefined;
  routeError?: boolean;
  routeMessage?: string;
  fetchError: boolean;
  gpsErrorText?: string | null;
  networkError: boolean;
  sameStation: boolean;
  onSelect: (result: RouteSearchResultCard) => void;
  t: (value: string) => string;
}) {
  return (
    <>
      {networkError ? <InlineNoticeRow text={t('internet_offline')} variant="alert" /> : null}
      {fetchError ? <InlineNoticeRow text={t('fetch-error')} variant="alert" /> : null}
      {gpsErrorText ? <InlineNoticeRow text={gpsErrorText} variant="alert" /> : null}
      {sameStation ? <InlineNoticeRow text={t('samestation-info')} variant="info" /> : null}

      {results ? (
        results.slice(0, 15).map((result, index) => (
          <Pressable
            key={`${result.busNo}-${result.arrivalTime}-${index}`}
            {...e2eProps(`route-result-${index}`)}
            style={styles.resultCard}
            onPress={() => onSelect(result)}
          >
            <View style={styles.resultBusNoContainer}>
              <RouteBusIcon busNo={result.busNo} colorCode={result.config?.colorCode} width={66} />
            </View>

            <View style={styles.resultDetails}>
              <View style={styles.resultRouteBlock}>
                <Text style={styles.resultLabel}>{t('bus-start-station')}</Text>
                <View style={styles.resultTextContainer}>
                  <Ionicons name="locate-outline" size={17} color="rgb(49, 112, 246)" />
                  <Text style={styles.resultDetailText} numberOfLines={1}>
                    {result.start}
                  </Text>
                </View>
              </View>

              <View style={styles.resultRouteBlock}>
                <Text style={styles.resultLabel}>{t('next-bus-arrival-info')}</Text>
                <View style={styles.resultTextContainer}>
                  <Ionicons name="time-outline" size={17} color="rgb(212, 119, 45)" />
                  <Text style={styles.resultDetailText} numberOfLines={1}>
                    {result.arrivalTime}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.resultTotalTime}>
              <View style={styles.resultTotalTimeRow}>
                <Text style={styles.resultTotalTimeValue}>
                  {result.outputTime > 1000 ? 'N/A' : result.outputTime}
                </Text>
                <Text style={styles.resultTotalTimeUnit}> min</Text>
              </View>
              <Text style={styles.resultWaitLabel}>{t('wait-time-desc')}</Text>
            </View>

            {result.config?.scheduleType === 'reported' ? (
              <InlineNoticeRow
                text={`${result.config.scheduleConfig?.count ?? 1} ${t('bus-reported-by-user')}`}
                variant="info"
                style={styles.resultWarningRow}
              />
            ) : null}

            {result.warning ? (
              <InlineNoticeRow
                text={t(result.warning)}
                variant="alert"
                style={styles.resultWarningRow}
              />
            ) : null}
          </Pressable>
        ))
      ) : routeError ? (
        <InlineNoticeRow text={t(routeMessage ?? '')} variant="alert" />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  resultCard: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    gap: 10,
    shadowColor: '#a6adc9',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 2, height: 15 },
    elevation: 4,
  },
  resultBusNoContainer: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultDetails: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  resultRouteBlock: {
    gap: 2,
  },
  resultLabel: {
    color: '#aaa',
    fontSize: 12,
    paddingLeft: 21,
  },
  resultTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultDetailText: {
    flex: 1,
    color: '#222',
    fontSize: 16,
  },
  resultTotalTime: {
    width: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  resultTotalTimeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  resultTotalTimeValue: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111',
    lineHeight: 22,
  },
  resultTotalTimeUnit: {
    color: '#111',
    fontSize: 12,
    marginBottom: 2,
  },
  resultWaitLabel: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'right',
  },
  resultWarningRow: {
    width: '100%',
    marginHorizontal: 0,
    marginTop: 2,
  },
});
