import React, { useEffect, useMemo, useState } from 'react';
import { Animated, ScrollView, StyleSheet, type RefreshControlProps } from 'react-native';
import { InlineNoticeRow } from '../InlineNoticeRow';
import { RealtimeBusRow } from '../RealtimeBusRow';
import { RealtimeNearbyNotice } from './RealtimeNearbyNotice';
import type { RealtimeRowData } from '../../types/mobile';

type NoticeVariant = 'alert' | 'info' | 'critical';

type NoticeItem = {
  key: string;
  text: string;
  variant: NoticeVariant;
};

type RenderedNotice = NoticeItem & {
  renderKey: string;
  progress: Animated.Value;
};

let noticeInstanceCount = 0;

function createRenderedNotice(notice: NoticeItem, initialValue: number) {
  return {
    ...notice,
    renderKey: `${notice.key}-${noticeInstanceCount++}`,
    progress: new Animated.Value(initialValue),
  };
}

export function RealtimeResultsList({
  rows,
  networkError,
  fetchError,
  gpsErrorText,
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
  gpsErrorText?: string | null;
  groupedNearbyStops: string[];
  onSelectGroupedStop: (value: string) => void;
  onSelectRow: (row: RealtimeRowData) => void;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentBottomPadding?: number;
  t: (value: string) => string;
}) {
  const notices = useMemo<NoticeItem[]>(() => {
    const nextNotices: NoticeItem[] = [];

    if (networkError) {
      nextNotices.push({ key: 'network', text: t('internet_offline'), variant: 'alert' });
    }

    if (fetchError) {
      nextNotices.push({ key: 'fetch', text: t('fetch-error'), variant: 'alert' });
    }

    if (gpsErrorText) {
      nextNotices.push({ key: 'gps', text: gpsErrorText, variant: 'alert' });
    }

    return nextNotices;
  }, [fetchError, gpsErrorText, networkError, t]);

  const [renderedNotices, setRenderedNotices] = useState<RenderedNotice[]>(() =>
    notices.map((notice) => createRenderedNotice(notice, 1)),
  );

  useEffect(() => {
    setRenderedNotices((current) => {
      const currentMap = new Map(current.map((notice) => [notice.key, notice]));
      const nextKeys = new Set(notices.map((notice) => notice.key));
      const nextRendered = [...current];

      notices.forEach((notice) => {
        const existing = currentMap.get(notice.key);
        if (existing) {
          Animated.timing(existing.progress, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (!finished) return;
            const replacement = createRenderedNotice(notice, 0);

            setRenderedNotices((latest) => [
              ...latest.filter((item) => item.renderKey !== existing.renderKey),
              replacement,
            ]);

            Animated.timing(replacement.progress, {
              toValue: 1,
              duration: 220,
              useNativeDriver: true,
            }).start();
          });
          return;
        }

        const incoming = createRenderedNotice(notice, 0);
        nextRendered.push(incoming);

        Animated.timing(incoming.progress, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }).start();
      });

      current.forEach((notice) => {
        if (nextKeys.has(notice.key)) {
          return;
        }

        Animated.timing(notice.progress, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (!finished) return;
          setRenderedNotices((latest) =>
            latest.filter((item) => item.renderKey !== notice.renderKey),
          );
        });
      });

      return nextRendered;
    });
  }, [notices]);

  const hasInlineNotice = renderedNotices.length > 0 || groupedNearbyStops.length > 0;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding }]}
      refreshControl={refreshControl}
    >
      {renderedNotices.map((notice) => (
        <Animated.View
          key={notice.renderKey}
          style={{
            opacity: notice.progress,
            transform: [
              {
                translateY: notice.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-8, 0],
                }),
              },
            ],
          }}
        >
          <InlineNoticeRow text={notice.text} variant={notice.variant} />
        </Animated.View>
      ))}
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
