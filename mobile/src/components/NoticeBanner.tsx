import React, { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

function stripHtml(input: string) {
  return input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function NoticeBanner({ notice }: { notice: any }) {
  const { i18n, t } = useTranslation('global');
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const lang = i18n.language.includes('en') ? 1 : 0;

  const currentNotice = useMemo(() => {
    const visible = (notice ?? [])
      .filter((item: any) => item?.content?.[lang] && item?.pref?.hide !== 1)
      .reverse()
      .filter((item: any) => !dismissedIds.includes(item.id));
    return visible[0] ?? null;
  }, [dismissedIds, lang, notice]);

  if (!currentNotice) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.message}>{stripHtml(currentNotice.content[lang])}</Text>
      <View style={styles.actions}>
        {!!currentNotice.pref?.link && (
          <Pressable onPress={() => Linking.openURL(currentNotice.pref.link)}>
            <Text style={styles.link}>{t('toast_more_info')}</Text>
          </Pressable>
        )}
        <Pressable onPress={() => setDismissedIds((prev) => [...prev, currentNotice.id])}>
          <Text style={styles.dismiss}>{t('toast_dismiss')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#fff7d6',
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#e7d79d',
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
