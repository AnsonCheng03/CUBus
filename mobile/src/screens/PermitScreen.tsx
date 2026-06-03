import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppState } from '../providers/AppProvider';
import type { PermitData } from '../../../src/shared-core/app/types';

const EMPTY: PermitData = { name: '', sid: '', major: '', expiry: '' };

const busRoutes = {
  meet_class_bus: {
    '5': ['#c2d6ea', '#29a1d8'],
    '6A': ['#7c8644', '#585823'],
    '6B': ['#4f88c1', '#3f438f'],
    '7': ['#c2c2c2', '#666666'],
  },
  shuttle_bus: {
    '1': ['#fff149', '#f3b53a'],
    '2': ['#fff149', '#f3b53a'],
    '3': ['#a4cc39', '#318761'],
    '4': ['#f1a63b', '#e75a24'],
    '8': ['#ffe3a8', '#ffc55a'],
    'N': ['#d1b4d5', '#7961a8'],
    'H': ['#896391', '#453087'],
  },
} as const;

function PermitCard({
  permit,
  busMode,
}: {
  permit: Required<PermitData>;
  busMode: keyof typeof busRoutes;
}) {
  const title = busMode === 'meet_class_bus' ? 'Meet-Class Bus Permit' : 'Shuttle Bus Permit';
  const routeText = busMode === 'meet_class_bus' ? 'Routes 5, 6A, 6B, 7' : 'Routes 1, 2, 3, 4, 8, N, H';

  return (
    <View style={[styles.card, busMode === 'meet_class_bus' ? styles.cardMeetClass : styles.cardShuttle]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardEyebrow}>The Chinese University of Hong Kong</Text>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{routeText}</Text>
        </View>
        <View style={styles.headerSeal}>
          <Text style={styles.headerSealText}>CU</Text>
        </View>
      </View>

      <Text style={styles.routeIntro}>The Permit Holder is allowed to ride on the following routes</Text>
      <View style={styles.routeBadgeRow}>
        {Object.entries(busRoutes[busMode]).map(([route, colors]) => (
          <View key={route} style={[styles.routeBadge, { backgroundColor: colors[0], borderColor: colors[1] }]}>
            <Text style={styles.routeBadgeText}>{route}</Text>
          </View>
        ))}
      </View>

      <View style={styles.detailsPanel}>
        {[
          ['Name', permit.name],
          ['Student ID', permit.sid],
          ['Major', permit.major],
          ['Valid Until', permit.expiry],
        ].map(([label, value]) => (
          <View key={label} style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function PermitScreen() {
  const { t, i18n } = useTranslation('global');
  const { appSettings, setAppSettings } = useAppState();
  const saved = useMemo<Required<PermitData>>(
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
    ? 'The bus pass provided in this app is a creative local-only card for entertainment and convenience. It is not an official CUHK identification document.'
    : '本應用程式內展示的校巴證僅為本地創作卡片，方便查閱及娛樂用途，並非香港中文大學正式身份證明文件。';

  const save = () => {
    const trimmed: Required<PermitData> = {
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
    <ScreenContainer title={t('NAV-Permit')} subtitle={desc}>
      {mode === 'edit' ? (
        <View style={styles.formCard}>
          {[
            ['School_Bus_Permit_Name', 'name'],
            ['School_Bus_Permit_SID', 'sid'],
            ['School_Bus_Permit_Major', 'major'],
            ['School_Bus_Permit_Exp', 'expiry'],
          ].map(([key, field]) => (
            <View key={field} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t(key)}</Text>
              <TextInput
                value={form[field as keyof typeof form]}
                onChangeText={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    [field]: field === 'major' ? value.toUpperCase() : value,
                  }))
                }
                style={styles.input}
                placeholderTextColor="#7b8d87"
              />
            </View>
          ))}
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
      ) : (
        <>
          <PermitCard permit={form} busMode="shuttle_bus" />
          <PermitCard permit={form} busMode="meet_class_bus" />
          <Pressable style={styles.primaryButton} onPress={() => setMode('edit')}>
            <Text style={styles.primaryButtonText}>{t('Permit_Edit')}</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              setForm({ ...EMPTY });
              setAppSettings((prev) => ({ ...prev, schoolBusPermit: { ...EMPTY } }));
              setMode('edit');
            }}
          >
            <Text style={styles.secondaryButtonText}>{t('Clear')}</Text>
          </Pressable>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: '#fffdf8',
    borderRadius: 22,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#ddd5c4',
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: '#30534c',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#f8f4ea',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#173f35',
  },
  card: {
    borderRadius: 26,
    padding: 18,
    gap: 14,
  },
  cardShuttle: {
    backgroundColor: '#1d7b6f',
  },
  cardMeetClass: {
    backgroundColor: '#465f97',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardEyebrow: {
    color: '#d8f8ed',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: '#fff8df',
    fontSize: 24,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: '#d9fff2',
    fontSize: 13,
  },
  headerSeal: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSealText: {
    color: '#fff8df',
    fontWeight: '900',
    fontSize: 16,
  },
  routeIntro: {
    color: '#eefef7',
    lineHeight: 20,
  },
  routeBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  routeBadge: {
    minWidth: 42,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
  },
  routeBadgeText: {
    color: '#173f35',
    fontWeight: '900',
  },
  detailsPanel: {
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 14,
  },
  detailRow: {
    gap: 2,
  },
  detailLabel: {
    color: '#d9fff2',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailValue: {
    color: '#fffdf8',
    fontSize: 17,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#0f766e',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#efe8d8',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#21463e',
    fontWeight: '800',
  },
});
