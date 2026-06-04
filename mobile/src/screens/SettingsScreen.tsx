import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BusMapModal } from '../components/BusMapModal';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppState } from '../providers/AppProvider';
import { i18next } from '../lib/i18n';

type WebsiteLink = [string[], string];

function Section({ children }: { children: React.ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

function Row({
  label,
  onPress,
  right,
  noDivider = false,
}: {
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
  noDivider?: boolean;
}) {
  const content = (
    <View style={[styles.row, noDivider && styles.rowNoDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      {right}
    </View>
  );

  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

export function SettingsScreen() {
  const { t } = useTranslation('global');
  const { appSettings, setAppSettings, appData, networkError, resetApp, setAppTempData, syncDelta } =
    useAppState();
  const [busMapVisible, setBusMapVisible] = useState(false);
  const langIndex = i18next.language.includes('en') ? 0 : 1;

  const websiteLinks = ((appData.WebsiteLinks as WebsiteLink[]) ?? []).filter(
    (row) => row?.[0]?.[langIndex] && row?.[1],
  );

  return (
    <ScreenContainer
      title={t('NAV-Settings')}
      subtitle={t('meta_desc_settings') || 'Preferences and links'}
      contentPadding={0}
      headerSpacing={12}
      contentStyle={styles.pageContent}
    >
      <BusMapModal visible={busMapVisible} onClose={() => setBusMapVisible(false)} />

      <View style={styles.sectionGroup}>
        <Section>
          <Row
            label={i18next.language.includes('en') ? '轉換語言' : 'Change Language'}
            onPress={() => {
              const next = i18next.language.includes('en') ? 'zh' : 'en';
              i18next.changeLanguage(next).then(() => {
                setAppTempData('realTimeStation', null);
                setAppTempData('searchStation', null);
              });
            }}
          />
          <Row
            label={t('routeNoWaitTimeT')}
            right={
              <Switch
                value={!!appSettings.searchSortDontIncludeWaitTime}
                onValueChange={(value) =>
                  setAppSettings((prev) => ({ ...prev, searchSortDontIncludeWaitTime: value }))
                }
                trackColor={{ true: '#630a10' }}
              />
            }
            noDivider
          />
          <Text style={styles.noteText}>{t('routeNoWaitTimeD')}</Text>
          {networkError.batch ? (
            <View style={styles.errorRow}>
              <Text style={styles.errorText}>{t('batch_fetch_err')}</Text>
              <Pressable onPress={() => syncDelta().catch(() => {})}>
                <Text style={styles.retryText}>{t('retry_btn')}</Text>
              </Pressable>
            </View>
          ) : null}
          <Row label={t('Reload-Data')} onPress={() => syncDelta().catch(() => {})} />
          <Row label={t('Delete-Storage')} onPress={() => resetApp().catch(() => {})} noDivider />
        </Section>
      </View>

      <View style={styles.sectionGroup}>
        <Section>
          <Row label={t('bus_map_page')} onPress={() => setBusMapVisible(true)} />
          {websiteLinks.map((row, index) => (
            <Row
              key={`${row[0][langIndex]}-${index}`}
              label={row[0][langIndex]}
              onPress={() => Linking.openURL(row[1])}
              noDivider={index === websiteLinks.length - 1}
            />
          ))}
        </Section>
      </View>

      <View style={styles.sectionGroup}>
        <Section>
          <Row label={t('About-btn')} onPress={() => Linking.openURL('https://github.com/AnsonCheng03')} />
          <Row
            label={t('Designer-Abt-btn')}
            onPress={() => Linking.openURL('https://www.instagram.com/01.0720/')}
            noDivider
          />
        </Section>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionGroup: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#dddddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowNoDivider: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    flex: 1,
    color: '#111',
    fontSize: 16,
  },
  noteText: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 12,
    color: '#666',
    fontSize: 13,
    lineHeight: 18,
  },
  errorRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  errorText: {
    flex: 1,
    color: '#666',
    fontSize: 13,
    lineHeight: 18,
  },
  retryText: {
    color: '#630a10',
    fontWeight: '700',
  },
});
