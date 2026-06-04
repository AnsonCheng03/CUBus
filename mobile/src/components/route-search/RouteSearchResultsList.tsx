import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { InlineNoticeRow } from '../InlineNoticeRow';
import type { RouteSearchResultCard } from '../../types/mobile';

export function RouteSearchResultsList({
  results,
  routeError,
  routeMessage,
  fetchError,
  networkError,
  sameStation,
  onSelect,
  t,
}: {
  results: RouteSearchResultCard[] | null | undefined;
  routeError?: boolean;
  routeMessage?: string;
  fetchError: boolean;
  networkError: boolean;
  sameStation: boolean;
  onSelect: (result: RouteSearchResultCard) => void;
  t: (value: string) => string;
}) {
  return (
    <>
      {networkError ? <InlineNoticeRow text={t('internet_offline')} variant="alert" /> : null}
      {fetchError ? <InlineNoticeRow text={t('fetch-error')} variant="alert" /> : null}
      {sameStation ? <InlineNoticeRow text={t('samestation-info')} variant="info" /> : null}

      {results ? (
        results.slice(0, 15).map((result, index) => (
          <Pressable
            key={`${result.busNo}-${result.arrivalTime}-${index}`}
            style={styles.resultCard}
            onPress={() => onSelect(result)}
          >
            <View style={styles.resultTopRow}>
              <View
                style={[styles.resultBadge, { backgroundColor: result.config?.colorCode || '#f3d37c' }]}
              >
                <Text style={styles.resultBadgeText}>{result.busNo}</Text>
              </View>
              <Text style={styles.resultTime}>
                {result.outputTime > 1000 ? 'N/A' : `${result.outputTime} min`}
              </Text>
            </View>
            <Text style={styles.resultRoute}>{result.start}</Text>
            <Text style={styles.resultMeta}>{`${t('next-bus-arrival-info')}: ${result.arrivalTime}`}</Text>
            <Text style={styles.resultMeta}>{`${t('wait-time-desc')}: ${result.waitTime} min`}</Text>
            {result.warning ? <Text style={styles.resultWarning}>{t(result.warning)}</Text> : null}
          </Pressable>
        ))
      ) : routeError ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultRoute}>{t(routeMessage ?? '')}</Text>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
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
