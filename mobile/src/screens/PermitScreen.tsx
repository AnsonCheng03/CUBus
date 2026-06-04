import React, { useEffect, useMemo, useState } from 'react';
import { Image, ImageBackground, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../components/ScreenContainer';
import {
  EMPTY_PERMIT,
  cuhkLogo,
  meetClassBusImage,
  permitBusRoutes,
  shuttleBusImage,
} from '../lib/permit';
import { useAppState } from '../providers/AppProvider';
import type { PermitData } from '../../../src/shared-core/app/types';
import type { PermitFormValue } from '../types/mobile';

function PermitCard({
  permit,
  busMode,
}: {
  permit: PermitFormValue;
  busMode: keyof typeof permitBusRoutes;
}) {
  const title = busMode === 'meet_class_bus' ? '轉堂校巴證' : '穿梭校巴證';
  const subtitle = busMode === 'meet_class_bus' ? 'Meet-Class Bus Permit' : 'Shuttle Bus Permit';
  const busImage = busMode === 'meet_class_bus' ? meetClassBusImage : shuttleBusImage;

  return (
    <View style={styles.cardPreview}>
      <ImageBackground
        source={busImage}
        resizeMode="cover"
        style={styles.card}
        imageStyle={styles.cardImage}
      >
        <View style={styles.cardOverlay}>
          <View style={styles.cardInner}>
            <View style={styles.cardHeader}>
              <View style={styles.logo}>
                <Image source={cuhkLogo} style={styles.logoImage} resizeMode="contain" />
              </View>
              <View style={styles.schoolBlock}>
                <Text style={styles.schoolZh}>香港中文大學</Text>
                <Text style={styles.schoolEn}>The Chinese University of Hong Kong</Text>
              </View>
              <View style={styles.hintBlock}>
                <Text style={styles.hintZh}>落車前請按鐘一次</Text>
                <Text style={styles.hintEn}>To Stop Press The Bell Once</Text>
              </View>
            </View>

            <View style={styles.cardNameBlock}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardSubtitle}>{subtitle}</Text>
            </View>

            <View style={styles.routeSection}>
              <Text style={styles.routeDesc}>持證者獲交通事務處批准乘搭下列的穿梭校巴路線</Text>
              <Text style={styles.routeDesc}>
                The Permit Holder is allowed to ride on the following routes
              </Text>
              <View style={styles.routeRow}>
                {Object.entries(permitBusRoutes[busMode]).map(([route, colors]) => (
                  <View
                    key={route}
                    style={[styles.routeChip, { backgroundColor: colors[0], borderColor: colors[1] }]}
                  >
                    <Text style={styles.routeChipText}>{route}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.dataSection}>
              {[
                ['學生姓名\nName', permit.name],
                ['學生編號\nStudent ID', permit.sid],
                ['主修科目\nMajor', permit.major],
                ['有效期至\nValid Until', permit.expiry],
              ].map(([label, value]) => (
                <View key={label} style={styles.dataRow}>
                  <Text style={styles.dataLabel}>{label}</Text>
                  <Text style={styles.dataValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

export function PermitScreen() {
  const { t, i18n } = useTranslation('global');
  const { appSettings, setAppSettings } = useAppState();
  const saved = useMemo<PermitFormValue>(
    () => ({
      name: appSettings.schoolBusPermit?.name ?? '',
      sid: appSettings.schoolBusPermit?.sid ?? '',
      major: appSettings.schoolBusPermit?.major ?? '',
      expiry: appSettings.schoolBusPermit?.expiry ?? '',
    }),
    [appSettings.schoolBusPermit],
  );

  const [form, setForm] = useState(saved);
  const [mode, setMode] = useState<'edit' | 'view'>(saved.name ? 'view' : 'edit');

  useEffect(() => {
    setForm(saved);
  }, [saved]);

  const desc = i18n.language.includes('en')
    ? 'The bus pass provided on this app is a creative work intended solely for entertainment purposes and is not an official document issued, endorsed, or authorized by The Chinese University of Hong Kong or any of its affiliated departments.'
    : '本應用程式所展示的校巴證僅為創作作品，旨在提供趣味性及娛樂用途，並非由香港中文大學或其任何相關部門授權、認可或發行的正式證件。';

  const save = () => {
    const trimmed: PermitFormValue = {
      name: form.name.trim(),
      sid: form.sid.trim(),
      major: form.major.trim().toUpperCase(),
      expiry: form.expiry.trim(),
    };
    if (!trimmed.name || !trimmed.sid || !trimmed.major || !trimmed.expiry) {
      return;
    }
    setAppSettings((prev) => ({ ...prev, schoolBusPermit: trimmed }));
    setForm(trimmed);
    setMode('view');
  };

  return (
    <ScreenContainer
      title={t('NAV-Permit')}
      showHeader={false}
      contentPadding={20}
      contentStyle={styles.pageContent}
    >
      {mode === 'edit' ? (
        <View style={styles.formPage}>
          <Text style={styles.disclaimerEdit}>{desc}</Text>
          {[
            ['School_Bus_Permit_Name', 'name', 'Vanessa'],
            ['School_Bus_Permit_SID', 'sid', '1155123456'],
            ['School_Bus_Permit_Major', 'major', 'CSCIN'],
            ['School_Bus_Permit_Exp', 'expiry', '4/1989'],
          ].map(([key, field, placeholder]) => (
            <View key={field} style={styles.inputRow}>
              <Text style={styles.inputLabel}>{t(key)}</Text>
              <TextInput
                value={form[field as keyof typeof form]}
                onChangeText={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    [field]: field === 'major' ? value.toUpperCase() : value,
                  }))
                }
                placeholder={placeholder}
                placeholderTextColor="#999"
                style={styles.input}
              />
            </View>
          ))}
          <View style={styles.buttonColumn}>
            <Pressable style={styles.primaryButton} onPress={save}>
              <Text style={styles.primaryButtonText}>{t('Permit_Save')}</Text>
            </Pressable>
            {saved.name ? (
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  setForm(saved);
                  setMode('view');
                }}
              >
                <Text style={styles.secondaryButtonText}>{t('Cancel')}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.viewPage}>
          <Text style={styles.disclaimerView}>{desc}</Text>
          <PermitCard permit={form} busMode="shuttle_bus" />
          <PermitCard permit={form} busMode="meet_class_bus" />
          <View style={styles.buttonColumn}>
            <Pressable style={styles.primaryButton} onPress={() => setMode('edit')}>
              <Text style={styles.primaryButtonText}>{t('Permit_Edit')}</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => {
                setForm({ ...EMPTY_PERMIT });
                setMode('edit');
              }}
            >
              <Text style={styles.secondaryButtonText}>{t('Clear')}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageContent: {
    paddingBottom: 24,
  },
  formPage: {
    gap: 12,
  },
  viewPage: {
    gap: 10,
  },
  disclaimerEdit: {
    marginHorizontal: 6,
    marginVertical: 10,
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  disclaimerView: {
    marginHorizontal: '10%',
    marginVertical: 12,
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  inputRow: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  inputLabel: {
    color: '#444',
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    color: '#111',
    fontSize: 18,
    paddingVertical: 4,
  },
  buttonColumn: {
    gap: 10,
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#630a10',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#444',
    fontWeight: '700',
  },
  cardPreview: {
    width: '80%',
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    maxWidth: 640,
  },
  card: {
    minHeight: 270,
    justifyContent: 'flex-start',
  },
  cardImage: {
    borderRadius: 10,
  },
  cardOverlay: {
    minHeight: 270,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  cardInner: {
    paddingVertical: 18,
    paddingHorizontal: 28,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logo: {
    width: 42,
  },
  logoImage: {
    width: 34,
    height: 34,
  },
  schoolBlock: {
    flex: 1,
    marginHorizontal: 8,
  },
  schoolZh: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 3,
  },
  schoolEn: {
    color: '#fff',
    fontSize: 10,
  },
  hintBlock: {
    width: 94,
    alignItems: 'center',
  },
  hintZh: {
    color: '#fff',
    fontSize: 10,
  },
  hintEn: {
    color: '#fff',
    fontSize: 8,
    textTransform: 'uppercase',
  },
  cardNameBlock: {
    marginTop: 8,
    marginBottom: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 36,
    letterSpacing: 2,
    fontWeight: '700',
    marginLeft: -2,
  },
  cardSubtitle: {
    color: '#fff',
    fontSize: 16,
    textTransform: 'uppercase',
    marginTop: -2,
  },
  routeSection: {
    marginTop: 2,
  },
  routeDesc: {
    color: 'rgb(236, 240, 241)',
    fontSize: 10,
  },
  routeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 8,
    marginBottom: 6,
  },
  routeChip: {
    width: 31,
    paddingVertical: 1,
    borderWidth: 1,
    alignItems: 'center',
  },
  routeChipText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '700',
  },
  dataSection: {
    marginTop: 12,
    gap: 8,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dataLabel: {
    width: 118,
    color: '#fff',
    fontSize: 11,
    lineHeight: 12,
  },
  dataValue: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    lineHeight: 14,
  },
});
