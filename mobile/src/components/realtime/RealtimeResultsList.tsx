import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  instanceKey: string;
};

type RenderedNotice = NoticeItem & {
  progress: Animated.Value;
};

function createRenderedNotice(notice: NoticeItem, initialValue: number) {
  return {
    ...notice,
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
  const noticeVersionRef = useRef(new Map<string, number>());
  const previousNoticeRef = useRef(
    new Map<string, Pick<NoticeItem, 'text' | 'variant' | 'instanceKey'>>(),
  );

  const notices = useMemo<NoticeItem[]>(() => {
    const nextNotices: Omit<NoticeItem, 'instanceKey'>[] = [];

    if (networkError) {
      nextNotices.push({ key: 'network', text: t('internet_offline'), variant: 'alert' });
    }

    if (fetchError) {
      nextNotices.push({ key: 'fetch', text: t('fetch-error'), variant: 'alert' });
    }

    if (gpsErrorText) {
      nextNotices.push({ key: 'gps', text: gpsErrorText, variant: 'alert' });
    }

    return nextNotices.map((notice) => {
      const previous = previousNoticeRef.current.get(notice.key);
      const previousVersion = noticeVersionRef.current.get(notice.key) ?? 0;
      const version =
        previous &&
        previous.text === notice.text &&
        previous.variant === notice.variant
          ? previousVersion
          : previousVersion + 1;

      noticeVersionRef.current.set(notice.key, version);

      return {
        ...notice,
        instanceKey: `${notice.key}:${version}`,
      };
    });
  }, [fetchError, gpsErrorText, networkError, t]);

  const [renderedNotices, setRenderedNotices] = useState<RenderedNotice[]>(() =>
    notices.map((notice) => createRenderedNotice(notice, 1)),
  );

  useEffect(() => {
    previousNoticeRef.current = new Map(
      notices.map((notice) => [
        notice.key,
        {
          text: notice.text,
          variant: notice.variant,
          instanceKey: notice.instanceKey,
        },
      ]),
    );
  }, [notices]);

  useEffect(() => {
    setRenderedNotices((current) => {
      const currentInstanceMap = new Map(current.map((notice) => [notice.instanceKey, notice]));
      const nextLogicalKeys = new Set(notices.map((notice) => notice.key));
      const nextInstanceKeys = new Set(notices.map((notice) => notice.instanceKey));
      const nextRendered = [...current];

      notices.forEach((notice) => {
        if (currentInstanceMap.has(notice.instanceKey)) {
          return;
        }

        const existing = current.find((item) => item.key === notice.key);
        if (existing) {
          Animated.timing(existing.progress, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (!finished) return;
            const replacement = createRenderedNotice(notice, 0);

            setRenderedNotices((latest) => [
              ...latest.filter((item) => item.instanceKey !== existing.instanceKey),
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
        if (nextInstanceKeys.has(notice.instanceKey) || nextLogicalKeys.has(notice.key)) {
          return;
        }

        Animated.timing(notice.progress, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (!finished) return;
          setRenderedNotices((latest) =>
            latest.filter((item) => item.instanceKey !== notice.instanceKey),
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
          key={notice.instanceKey}
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
