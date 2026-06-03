import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppState } from '../providers/AppProvider';

const EMPTY = { name: '', sid: '', major: '', expiry: '' };

function PermitCard({
  title,
  subtitle,
  permit,
}: {
  title: string;
  subtitle: string;
  permit: { name: string; sid: string; major: string; expiry: string };
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardRow}>Name: {permit.name}</Text>
        <Text style={styles.cardRow}>Student ID: {permit.sid}</Text>
        <Text style={styles.cardRow}>Major: {permit.major}</Text>
        <Text style={styles.cardRow}>Valid Until: {permit.expiry}</Text>
      </View>
    </View>
  );
}

export function PermitScreen() {
  const { t, i18n } = useTranslation('global');
  const { appSettings, setAppSettings } = useAppState();
  const saved = useMemo(
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

  const desc = i18n.language.includes('en')
    ? 'This permit is a creative local-only card for entertainment and convenience. It is not an official CUHK identification document.'
    : '此校巴證僅為本地創作卡片，方便查閱及娛樂用途，並非香港中文大學正式身份證明文件。';

  const save = () => {
    const trimmed = {
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
                onChangeText={(value) => setForm((prev) => ({ ...prev, [field]: value }))}
                style={styles.input}
                placeholderTextColor="#7b8d87"
              />
            </View>
          ))}
          <Pressable style={styles.primaryButton} onPress={save}>
            <Text style={styles.primaryButtonText}>{t('Permit_Save')}</Text>
          </Pressable>
          {saved.name ? (
            <Pressable style={styles.secondaryButton} onPress={() => setMode('view')}>
              <Text style={styles.secondaryButtonText}>{t('Cancel')}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <>
          <PermitCard title="Shuttle Bus Permit" subtitle="Routes 1, 2, 3, 4, 8, N, H" permit={form} />
          <PermitCard title="Meet-Class Permit" subtitle="Routes 5, 6A, 6B, 7" permit={form} />
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
    backgroundColor: '#1d7b6f',
    borderRadius: 26,
    padding: 18,
    gap: 18,
  },
  cardHeader: {
    gap: 4,
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
  cardBody: {
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 14,
  },
  cardRow: {
    color: '#fffdf8',
    fontSize: 16,
    fontWeight: '600',
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
