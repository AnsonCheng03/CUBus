import React from 'react';
import { ScrollView, StyleSheet, type RefreshControlProps } from 'react-native';
import { InlineNoticeRow } from '../InlineNoticeRow';
import { RealtimeBusRow } from '../RealtimeBusRow';
import { RealtimeNearbyNotice } from './RealtimeNearbyNotice';
import type { RealtimeRowData } from '../../types/mobile';

export function RealtimeResultsList({
  rows,
  networkError,
  fetchError,
  groupedNearbyStops,
  onSelectGroupedStop,
  onSelectRow,
  refreshControl,
  contentBottomPadding = 0,
  t,
}: {
  rows: RealtimeRowData[];
  networkError: boolean;
  fetchError: boolean;
  groupedNearbyStops: string[];
  onSelectGroupedStop: (value: string) => void;
  onSelectRow: (row: RealtimeRowData) => void;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentBottomPadding?: number;
  t: (value: string) => string;
}) {
  const hasInlineNotice = networkError || fetchError || groupedNearbyStops.length > 0;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding }]}
      refreshControl={refreshControl}
    >
      {networkError ? <InlineNoticeRow text={t('internet_offline')} variant="alert" /> : null}
      {fetchError ? <InlineNoticeRow text={t('fetch-error')} variant="alert" /> : null}
      <RealtimeNearbyNotice
        title={t('DescTxt-yrloc')}
        groups={groupedNearbyStops}
        translate={t}
        onSelect={onSelectGroupedStop}
      />

      {rows.length === 0 ? (
        <InlineNoticeRow text={t('No-bus-time')} variant="alert" />
      ) : (
        rows.map((bus, index) => (
          <RealtimeBusRow
            key={`${bus.busno}-${bus.time}-${index}`}
            bus={bus}
            t={t}
            showTopBorder={!(index === 0 && hasInlineNotice)}
            onPress={() => onSelectRow(bus)}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 0,
  },
});
