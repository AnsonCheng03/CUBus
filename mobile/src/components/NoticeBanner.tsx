import React, { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { usePathname } from 'expo-router';
import { NAV_RESPONSIVE_BREAKPOINT } from '../lib/layout';
import type { NoticeItem } from '../types/mobile';

function formatNoticeContent(input: string) {
  return input
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\\r\\n|\\n|\\r/g, '\n')
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .trim();
}

function isNoticeHidden(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return ['1', 'true'].includes(value.trim().toLowerCase());
  }
  return false;
}

const noticeColors = {
  primary: { backgroundColor: '#dbeafe', borderColor: '#93c5fd', textColor: '#1e3a8a' },
  secondary: { backgroundColor: '#ede9fe', borderColor: '#c4b5fd', textColor: '#4c1d95' },
  tertiary: { backgroundColor: '#fae8ff', borderColor: '#e879f9', textColor: '#701a75' },
  success: { backgroundColor: '#dcfce7', borderColor: '#86efac', textColor: '#166534' },
  warning: { backgroundColor: '#fff7d6', borderColor: '#e7d79d', textColor: '#5b4a08' },
  danger: { backgroundColor: '#fee2e2', borderColor: '#fca5a5', textColor: '#991b1b' },
  light: { backgroundColor: '#fff', borderColor: '#e5e7eb', textColor: '#374151' },
  medium: { backgroundColor: '#e5e7eb', borderColor: '#9ca3af', textColor: '#374151' },
  dark: { backgroundColor: '#1f2937', borderColor: '#111827', textColor: '#f9fafb' },
} as const;

export function NoticeBanner({ notice }: { notice?: NoticeItem[] | null }) {
  const { i18n, t } = useTranslation('global');
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const lang = i18n.language.includes('en') ? 1 : 0;
  const inTabShell = pathname === '/' || pathname.startsWith('/route') || pathname.startsWith('/permit') || pathname.startsWith('/settings');

  const currentNotice = useMemo(() => {
    const visible = (notice ?? [])
      .filter((item) => item?.content?.[lang] && !isNoticeHidden(item?.pref?.hide))
      .reverse()
      .filter((item) => !dismissedIds.includes(item.id));
    return visible[0] ?? null;
  }, [dismissedIds, lang, notice]);

  useEffect(() => {
    const duration = currentNotice?.pref?.duration ?? 0;
    if (!currentNotice || duration <= 0) return;

    const timer = setTimeout(() => {
      setDismissedIds((prev) =>
        prev.includes(currentNotice.id) ? prev : [...prev, currentNotice.id],
      );
    }, duration);

    return () => clearTimeout(timer);
  }, [currentNotice]);

  if (!currentNotice) return null;
  const noticeContent = currentNotice.content?.[lang] ?? '';
  const noticeLink = currentNotice.pref?.link;
  const dismissible = currentNotice.pref?.dismissible !== false;
  const palette = noticeColors[currentNotice.pref?.type ?? 'success'];

  return (
    <SafeAreaView
      pointerEvents="box-none"
      edges={['top']}
      style={[styles.overlay, width >= NAV_RESPONSIVE_BREAKPOINT && inTabShell && styles.overlayWithTopNav]}
    >
      <View
        style={[
          styles.banner,
          { backgroundColor: palette.backgroundColor, borderColor: palette.borderColor },
        ]}
      >
        <Text style={[styles.message, { color: palette.textColor }]}>
          {formatNoticeContent(noticeContent)}
        </Text>
        <View style={styles.actions}>
          {noticeLink ? (
            <Pressable onPress={() => Linking.openURL(noticeLink)}>
              <Text style={styles.link}>{t('toast_more_info')}</Text>
            </Pressable>
          ) : null}
          {dismissible ? (
            <Pressable
              onPress={() =>
                setDismissedIds((prev) =>
                  prev.includes(currentNotice.id) ? prev : [...prev, currentNotice.id],
                )
              }
            >
              <Text style={[styles.dismiss, { color: palette.textColor }]}>
                {t('toast_dismiss')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    elevation: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  overlayWithTopNav: {
    marginTop: 75,
  },
  banner: {
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  message: {
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  link: {
    color: '#0f766e',
    fontWeight: '700',
  },
  dismiss: {
    color: '#8b5e00',
    fontWeight: '700',
  },
});
