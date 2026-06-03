import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BusMapModal } from '../components/BusMapModal';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppState } from '../providers/AppProvider';
import { i18next } from '../lib/i18n';

type WebsiteLink = [string[], string];

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
    <ScreenContainer title={t('NAV-Settings')} subtitle={t('meta_desc_settings') || 'Preferences and links'}>
      <BusMapModal visible={busMapVisible} onClose={() => setBusMapVisible(false)} />
      <View style={styles.card}>
        <Pressable
          style={styles.row}
          onPress={async () => {
            const next = i18next.language.includes('en') ? 'zh' : 'en';
            await i18next.changeLanguage(next);
            setAppTempData('realTimeStation', null);
            setAppTempData('searchStation', null);
          }}
        >
          <Text style={styles.rowLabel}>{i18next.language.includes('en') ? '轉換語言' : 'Change Language'}</Text>
        </Pressable>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>{t('routeNoWaitTimeT')}</Text>
          <Switch
            value={!!appSettings.searchSortDontIncludeWaitTime}
            onValueChange={(value) =>
              setAppSettings((prev) => ({ ...prev, searchSortDontIncludeWaitTime: value }))
            }
            trackColor={{ true: '#0f766e' }}
          />
        </View>

        {networkError.batch ? <Text style={styles.warning}>{t('batch_fetch_err')}</Text> : null}

        <Pressable style={styles.row} onPress={() => syncDelta().catch(() => {})}>
          <Text style={styles.rowLabel}>{t('Reload-Data')}</Text>
        </Pressable>

        <Pressable style={styles.row} onPress={() => resetApp().catch(() => {})}>
          <Text style={styles.rowLabel}>{t('Delete-Storage')}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Pressable style={styles.row} onPress={() => setBusMapVisible(true)}>
          <Text style={styles.rowLabel}>{t('bus_map_page')}</Text>
        </Pressable>
        {websiteLinks.map((row, index) => (
          <Pressable key={`${row[0][langIndex]}-${index}`} style={styles.row} onPress={() => Linking.openURL(row[1])}>
            <Text style={styles.rowLabel}>{row[0][langIndex]}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Pressable style={styles.row} onPress={() => Linking.openURL('https://github.com/AnsonCheng03')}>
          <Text style={styles.rowLabel}>{t('About-btn')}</Text>
        </Pressable>
        <Pressable style={styles.row} onPress={() => Linking.openURL('https://www.instagram.com/01.0720/')}>
          <Text style={styles.rowLabel}>{t('Designer-Abt-btn')}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fffdf8',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ddd5c4',
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e4decf',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    color: '#21463e',
    fontWeight: '700',
    flex: 1,
  },
  warning: {
    color: '#7d5b00',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
});
