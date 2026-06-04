import React, { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { usePathname } from 'expo-router';
import { NAV_RESPONSIVE_BREAKPOINT } from '../lib/layout';
import type { NoticeItem } from '../types/mobile';

function stripHtml(input: string) {
  return input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function NoticeBanner({ notice }: { notice?: NoticeItem[] | null }) {
  const { i18n, t } = useTranslation('global');
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const lang = i18n.language.includes('en') ? 1 : 0;
  const inTabShell = pathname === '/' || pathname.startsWith('/route') || pathname.startsWith('/permit') || pathname.startsWith('/settings');

  const currentNotice = useMemo(() => {
    const visible = (notice ?? [])
      .filter((item) => item?.content?.[lang] && item?.pref?.hide !== 1)
      .reverse()
      .filter((item) => !dismissedIds.includes(item.id));
    return visible[0] ?? null;
  }, [dismissedIds, lang, notice]);

  if (!currentNotice) return null;
  const noticeContent = currentNotice.content?.[lang] ?? '';
  const noticeLink = currentNotice.pref?.link;

  return (
    <SafeAreaView
      pointerEvents="box-none"
      edges={['top']}
      style={[styles.overlay, width >= NAV_RESPONSIVE_BREAKPOINT && inTabShell && styles.overlayWithTopNav]}
    >
      <View style={styles.banner}>
        <Text style={styles.message}>{stripHtml(noticeContent)}</Text>
        <View style={styles.actions}>
          {noticeLink ? (
            <Pressable onPress={() => Linking.openURL(noticeLink)}>
              <Text style={styles.link}>{t('toast_more_info')}</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={() => setDismissedIds((prev) => [...prev, currentNotice.id])}>
            <Text style={styles.dismiss}>{t('toast_dismiss')}</Text>
          </Pressable>
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
    backgroundColor: '#fff7d6',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e7d79d',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  message: {
    color: '#5b4a08',
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
