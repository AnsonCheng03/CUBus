import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Switch, Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BusMapModal } from '../components/BusMapModal';
import { MOBILE_BOTTOM_NAV_OVERLAP } from '../components/CustomNavBar';
import { ScreenContainer } from '../components/ScreenContainer';
import { SettingsRow, SettingsSection } from '../components/settings/SettingsSection';
import { useAppState } from '../providers/AppProvider';
import { i18next } from '../lib/i18n';
import { NAV_RESPONSIVE_BREAKPOINT } from '../lib/layout';
import type { WebsiteLink } from '../types/mobile';

export function SettingsScreen() {
  const { t } = useTranslation('global');
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= NAV_RESPONSIVE_BREAKPOINT;
  const {
    appSettings,
    setAppSettings,
    appData,
    networkError,
    resetApp,
    clearTemporaryState,
    syncDelta,
  } =
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
      contentStyle={[
        styles.pageContent,
        !isLargeScreen && { paddingBottom: 24 + MOBILE_BOTTOM_NAV_OVERLAP },
      ]}
    >
      <BusMapModal visible={busMapVisible} onClose={() => setBusMapVisible(false)} />

      <View style={styles.sectionGroup}>
        <SettingsSection>
          <SettingsRow
            label={i18next.language.includes('en') ? '轉換語言' : 'Change Language'}
            onPress={() => {
              const next = i18next.language.includes('en') ? 'zh' : 'en';
              i18next.changeLanguage(next).then(() => {
                clearTemporaryState();
              });
            }}
          />
          <SettingsRow
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
          <SettingsRow label={t('Reload-Data')} onPress={() => syncDelta().catch(() => {})} />
          <SettingsRow
            label={t('Delete-Storage')}
            onPress={() => resetApp().catch(() => {})}
            noDivider
          />
        </SettingsSection>
      </View>

      <View style={styles.sectionGroup}>
        <SettingsSection>
          <SettingsRow label={t('bus_map_page')} onPress={() => setBusMapVisible(true)} />
          {websiteLinks.map((row, index) => (
            <SettingsRow
              key={`${row[0][langIndex]}-${index}`}
              label={row[0][langIndex]}
              onPress={() => Linking.openURL(row[1])}
              noDivider={index === websiteLinks.length - 1}
            />
          ))}
        </SettingsSection>
      </View>

      <View style={styles.sectionGroup}>
        <SettingsSection>
          <SettingsRow
            label={t('About-btn')}
            onPress={() => Linking.openURL('https://github.com/AnsonCheng03')}
          />
          <SettingsRow
            label={t('Designer-Abt-btn')}
            onPress={() => Linking.openURL('https://www.instagram.com/01.0720/')}
            noDivider
          />
        </SettingsSection>
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
