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
import { mobileQueryClient, mobileQueryKeys } from '../query/client';
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
      subtitle={t('meta_desc_settings')}
      contentPadding={24}
      headerSpacing={18}
      safeAreaBackgroundColor="#f6f2ee"
      contentStyle={[
        styles.pageContent,
        !isLargeScreen && { paddingBottom: 24 + MOBILE_BOTTOM_NAV_OVERLAP },
      ]}
    >
      <BusMapModal visible={busMapVisible} onClose={() => setBusMapVisible(false)} />

      <View style={styles.sectionGroup}>
        <SettingsSection>
          <SettingsRow
            label={t('settings_change_language')}
            testID="settings-change-language"
            onPress={() => {
              const next = i18next.language.includes('en') ? 'zh' : 'en';
              i18next.changeLanguage(next).then(() => {
                clearTemporaryState();
                mobileQueryClient.invalidateQueries({ queryKey: mobileQueryKeys.bootstrap });
                mobileQueryClient.invalidateQueries({ queryKey: mobileQueryKeys.realtime });
                mobileQueryClient.invalidateQueries({ queryKey: mobileQueryKeys.deltaSync });
              });
            }}
          />
          <SettingsRow
            label={t('routeNoWaitTimeT')}
            description={t('routeNoWaitTimeD')}
            right={
              <Switch
                {...{ testID: 'settings-no-wait-switch' }}
                value={!!appSettings.searchSortDontIncludeWaitTime}
                onValueChange={(value) =>
                  setAppSettings((prev) => ({ ...prev, searchSortDontIncludeWaitTime: value }))
                }
                trackColor={{ true: '#630a10' }}
              />
            }
          />
          {networkError.batch ? (
            <View style={styles.errorRow}>
              <Text style={styles.errorText}>{t('batch_fetch_err')}</Text>
              <Pressable onPress={() => syncDelta().catch(() => {})}>
                <Text style={styles.retryText}>{t('retry_btn')}</Text>
              </Pressable>
            </View>
          ) : null}
          <SettingsRow
            label={t('Reload-Data')}
            testID="settings-reload-data"
            onPress={() => syncDelta().catch(() => {})}
          />
          <SettingsRow
            label={t('Delete-Storage')}
            testID="settings-delete-storage"
            onPress={() => resetApp().catch(() => {})}
            noDivider
          />
        </SettingsSection>
      </View>

      <View style={styles.sectionGroup}>
        <SettingsSection>
          <SettingsRow
            label={t('bus_map_page')}
            testID="settings-bus-map"
            onPress={() => setBusMapVisible(true)}
          />
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
            testID="settings-about"
            onPress={() => Linking.openURL('https://github.com/AnsonCheng03')}
          />
          <SettingsRow
            label={t('Designer-Abt-btn')}
            testID="settings-designer-about"
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
    paddingTop: 10,
    paddingBottom: 24,
    backgroundColor: '#f6f2ee',
  },
  sectionGroup: {
    marginBottom: 18,
  },
  errorRow: {
    paddingHorizontal: 18,
    paddingTop: 2,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#fff',
  },
  errorText: {
    flex: 1,
    color: '#7a6c66',
    fontSize: 13,
    lineHeight: 18,
  },
  retryText: {
    color: '#630a10',
    fontWeight: '700',
  },
});
