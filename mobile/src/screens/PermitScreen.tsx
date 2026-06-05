import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MOBILE_BOTTOM_NAV_OVERLAP } from '../components/CustomNavBar';
import { PermitCard, PERMIT_CARD_RATIO } from '../components/PermitCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { EMPTY_PERMIT, permitBusRoutes } from '../lib/permit';
import { useAppState } from '../providers/AppProvider';
import { NAV_RESPONSIVE_BREAKPOINT } from '../lib/layout';
import type { PermitFormValue } from '../types/mobile';

export function PermitScreen() {
  const { t, i18n } = useTranslation('global');
  const { width, height } = useWindowDimensions();
  const isLargeScreen = width >= NAV_RESPONSIVE_BREAKPOINT;
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
  const [fullscreenBusMode, setFullscreenBusMode] = useState<keyof typeof permitBusRoutes | null>(
    null,
  );

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

  const previewWidth = Math.min(width * 0.8, 720);
  const isPortrait = height > width;
  const fullscreenCardWidth = isPortrait
    ? Math.min(height * 0.92, width * PERMIT_CARD_RATIO * 0.92)
    : Math.min(width * 0.92, height * PERMIT_CARD_RATIO * 0.92);

  return (
    <ScreenContainer
      title={t('NAV-Permit')}
      showHeader={false}
      contentPadding={20}
      contentStyle={[
        styles.pageContent,
        !isLargeScreen && { paddingBottom: 24 + MOBILE_BOTTOM_NAV_OVERLAP },
      ]}
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
          <PermitCard
            permit={form}
            busMode="shuttle_bus"
            targetWidth={previewWidth}
            onPress={() => setFullscreenBusMode('shuttle_bus')}
            testID="permit-card-shuttle"
          />
          <PermitCard
            permit={form}
            busMode="meet_class_bus"
            targetWidth={previewWidth}
            onPress={() => setFullscreenBusMode('meet_class_bus')}
            testID="permit-card-meet-class"
          />
          <View style={styles.buttonColumn}>
            <Pressable style={styles.primaryButton} onPress={() => setMode('edit')}>
              <Text style={styles.primaryButtonText}>{t('Permit_Edit')}</Text>
            </Pressable>
          </View>
        </View>
      )}
      <Modal
        visible={fullscreenBusMode !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreenBusMode(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setFullscreenBusMode(null)} />
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            horizontal={false}
            maximumZoomScale={1}
          >
            <View
              style={[
                styles.modalCardFrame,
                isPortrait && {
                  width: fullscreenCardWidth / PERMIT_CARD_RATIO,
                  height: fullscreenCardWidth,
                },
              ]}
            >
              {fullscreenBusMode ? (
                <View style={isPortrait ? { transform: [{ rotate: '90deg' }] } : null}>
                  <PermitCard
                    permit={form}
                    busMode={fullscreenBusMode}
                    targetWidth={fullscreenCardWidth}
                    withShadow={false}
                    testID="permit-card-fullscreen"
                  />
                </View>
              ) : null}
            </View>
            <Pressable style={styles.modalCloseButton} onPress={() => setFullscreenBusMode(null)}>
              <Text style={styles.modalCloseText}>{t('Permit_Close')}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(240, 240, 240, 0.95)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 16,
  },
  modalCardFrame: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  modalCloseText: {
    color: '#444',
    fontWeight: '700',
  },
});
