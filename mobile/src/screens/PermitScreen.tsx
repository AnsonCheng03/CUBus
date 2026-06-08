import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
import { permitBusRoutes } from '../lib/permit';
import { useAppState } from '../providers/AppProvider';
import { NAV_RESPONSIVE_BREAKPOINT } from '../lib/layout';
import type { PermitFormValue } from '../types/mobile';

const PERMIT_VARIANTS: Array<{
  mode: keyof typeof permitBusRoutes;
  title: string;
  subtitle: string;
}> = [
  {
    mode: 'shuttle_bus',
    title: '穿梭校巴證',
    subtitle: 'Shuttle Bus Permit',
  },
  {
    mode: 'meet_class_bus',
    title: '轉堂校巴證',
    subtitle: 'Meet-Class Bus Permit',
  },
];

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
  const [selectedBusMode, setSelectedBusMode] =
    useState<keyof typeof permitBusRoutes>('meet_class_bus');
  const carouselRef = useRef<ScrollView | null>(null);

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

  const selectedIndex = Math.max(
    0,
    PERMIT_VARIANTS.findIndex((variant) => variant.mode === selectedBusMode),
  );
  const selectedVariant = PERMIT_VARIANTS[selectedIndex] ?? PERMIT_VARIANTS[0];

  const cardStageWidth = Math.min(width - 56, 720);
  const carouselGap = 14;
  const carouselSidePadding = Math.max((width - 32 - cardStageWidth) / 2, 0);
  const isPortrait = height > width;
  const fullscreenCardWidth = isPortrait
    ? Math.min(height * 0.92, width * PERMIT_CARD_RATIO * 0.92)
    : Math.min(width * 0.92, height * PERMIT_CARD_RATIO * 0.92);

  const scrollToPermit = (mode: keyof typeof permitBusRoutes) => {
    const index = PERMIT_VARIANTS.findIndex((item) => item.mode === mode);
    if (index < 0) return;

    setSelectedBusMode(mode);
    carouselRef.current?.scrollTo({
      x: index * (cardStageWidth + carouselGap),
      animated: true,
    });
  };

  return (
    <ScreenContainer
      title={t('NAV-Permit')}
      showHeader={false}
      scrollable={false}
      contentPadding={0}
      contentGap={0}
      safeAreaBackgroundColor="#911f27"
      contentStyle={styles.pageContent}
    >
      <View style={styles.pageFrame}>
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{t('school_bus_permit_title')}</Text>
          </View>
          <Text style={styles.heroTitle}>{t('NAV-Permit')}</Text>
          <Text style={styles.heroSubtitle}>{desc}</Text>
        </View>

        <View style={styles.surfaceSection}>
          {mode === 'edit' ? (
            <View style={[styles.surfaceBody, !isLargeScreen && styles.surfaceBodyMobile]}>
              <View style={styles.formPage}>
                <View style={styles.formCard}>
                  {[
                    ['School_Bus_Permit_Name', 'name', 'Vanessa'],
                    ['School_Bus_Permit_SID', 'sid', '1155123456'],
                    ['School_Bus_Permit_Major', 'major', 'CSCIN'],
                    ['School_Bus_Permit_Exp', 'expiry', '4/1989'],
                  ].map(([key, field, placeholder], index, array) => (
                    <View
                      key={field}
                      style={[
                        styles.inputRow,
                        index !== array.length - 1 && styles.inputRowDivider,
                      ]}
                    >
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
                        placeholderTextColor="#9c8f88"
                        style={styles.input}
                      />
                    </View>
                  ))}
                </View>

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
            </View>
          ) : (
            <View
              style={[
                styles.surfaceBody,
                !isLargeScreen && styles.surfaceBodyMobile,
                { backgroundColor: '#fff' },
              ]}
            >
              <View style={styles.viewPage}>
                <View style={styles.passStageCard}>
                  <View style={styles.passStageMeta}>
                    <Text style={styles.passStageLabel}>{t('school_bus_permit_title')}</Text>
                    <Text style={styles.passStageTitle}>{selectedVariant.title}</Text>
                    <Text style={styles.passStageSubtitle}>{selectedVariant.subtitle}</Text>
                  </View>

                  <View
                    style={[
                      styles.passViewport,
                      { minHeight: cardStageWidth / PERMIT_CARD_RATIO + 18 },
                    ]}
                  >
                    <ScrollView
                      ref={carouselRef}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      decelerationRate="fast"
                      disableIntervalMomentum
                      pagingEnabled={false}
                      snapToInterval={cardStageWidth + carouselGap}
                      snapToAlignment="start"
                      bounces={false}
                      contentContainerStyle={[
                        styles.passCarouselContent,
                        { paddingHorizontal: carouselSidePadding },
                      ]}
                      onScrollEndDrag={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
                        const index = Math.round(
                          event.nativeEvent.contentOffset.x / (cardStageWidth + carouselGap),
                        );
                        const clampedIndex = Math.max(
                          0,
                          Math.min(index, PERMIT_VARIANTS.length - 1),
                        );
                        scrollToPermit(PERMIT_VARIANTS[clampedIndex].mode);
                      }}
                      onMomentumScrollEnd={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
                        const index = Math.round(
                          event.nativeEvent.contentOffset.x / (cardStageWidth + carouselGap),
                        );
                        const nextMode = PERMIT_VARIANTS[index]?.mode ?? 'meet_class_bus';
                        setSelectedBusMode(nextMode);
                      }}
                    >
                      {PERMIT_VARIANTS.map((variant, index) => (
                        <View
                          key={variant.mode}
                          style={[
                            styles.passCarouselItem,
                            {
                              width: cardStageWidth,
                              marginRight: index === PERMIT_VARIANTS.length - 1 ? 0 : carouselGap,
                            },
                          ]}
                        >
                          <PermitCard
                            permit={form}
                            busMode={variant.mode}
                            targetWidth={cardStageWidth}
                            onPress={() => setFullscreenBusMode(variant.mode)}
                            testID={
                              variant.mode === 'shuttle_bus'
                                ? 'permit-card-shuttle'
                                : 'permit-card-meet-class'
                            }
                          />
                        </View>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={styles.passDots}>
                    {PERMIT_VARIANTS.map((variant) => {
                      const active = variant.mode === selectedBusMode;

                      return (
                        <Pressable
                          key={variant.mode}
                          style={[styles.passDot, active && styles.passDotActive]}
                          onPress={() => scrollToPermit(variant.mode)}
                        />
                      );
                    })}
                  </View>
                </View>

                <View style={styles.buttonColumn}>
                  <Pressable style={styles.primaryButton} onPress={() => setMode('edit')}>
                    <Text style={styles.primaryButtonText}>{t('Permit_Edit')}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      <Modal
        visible={fullscreenBusMode !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFullscreenBusMode(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            testID="permit-fullscreen-backdrop"
            style={styles.modalFullscreenTap}
            onPress={() => setFullscreenBusMode(null)}
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
          </Pressable>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageContent: {
    flex: 1,
    backgroundColor: '#911f27',
  },
  pageFrame: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 34,
    backgroundColor: '#911f27',
    gap: 10,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroBadgeText: {
    color: '#fff4ea',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    lineHeight: 21,
  },
  surfaceSection: {
    flex: 1,
    backgroundColor: '#911f27',
    paddingTop: 12,
  },
  surfaceBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.82)',
    overflow: 'hidden',
  },
  surfaceBodyMobile: {
    paddingBottom: MOBILE_BOTTOM_NAV_OVERLAP + 18,
  },
  formPage: {
    flex: 1,
    gap: 16,
  },
  viewPage: {
    flex: 1,
    gap: 12,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#4d1c22',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  inputRow: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
  },
  inputRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#efe7e1',
  },
  inputLabel: {
    color: '#7f655a',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  input: {
    color: '#111',
    fontSize: 18,
    paddingVertical: 2,
  },
  passStageCard: {
    borderRadius: 26,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 24,
    elevation: 3,
  },
  passStageMeta: {
    alignItems: 'center',
    gap: 2,
  },
  passStageLabel: {
    color: '#8b6c61',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    paddingBottom: 10,
  },
  passStageTitle: {
    color: '#2f1b16',
    fontSize: 24,
    fontWeight: '800',
  },
  passStageSubtitle: {
    color: '#5f473d',
    fontSize: 14,
    fontWeight: '600',
  },
  passViewport: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  passCarouselContent: {
    alignItems: 'center',
  },
  passCarouselItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  passDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 2,
  },
  passDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#d8d8d8',
  },
  passDotActive: {
    width: 20,
    backgroundColor: '#911f27',
  },
  buttonColumn: {
    gap: 10,
    marginTop: 'auto',
    paddingTop: 4,
  },
  primaryButton: {
    backgroundColor: '#630a10',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#630a10',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryButton: {
    backgroundColor: '#efe4dc',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6e5348',
    fontWeight: '700',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(240, 240, 240, 0.95)',
  },
  modalFullscreenTap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  modalCardFrame: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
