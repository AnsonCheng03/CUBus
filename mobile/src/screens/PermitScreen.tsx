import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MOBILE_BOTTOM_NAV_OVERLAP } from '../components/CustomNavBar';
import { PERMIT_CARD_RATIO } from '../components/PermitCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { PermitFormSection } from '../components/permit/PermitFormSection';
import { PermitFullscreenModal } from '../components/permit/PermitFullscreenModal';
import { PermitHero } from '../components/permit/PermitHero';
import { PermitPassSection } from '../components/permit/PermitPassSection';
import { permitBusRoutes } from '../lib/permit';
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
  const [selectedBusMode, setSelectedBusMode] =
    useState<keyof typeof permitBusRoutes>('meet_class_bus');
  const carouselRef = useRef<ScrollView>(null);
  const surfaceBodyProgress = useRef(new Animated.Value(saved.name ? 1 : 0)).current;

  useEffect(() => {
    setForm(saved);
  }, [saved]);

  useEffect(() => {
    Animated.timing(surfaceBodyProgress, {
      toValue: mode === 'view' ? 1 : 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [mode, surfaceBodyProgress]);

  const desc = t('School_Bus_Permit_Desc');
  const permitVariants = useMemo<
    Array<{
      mode: keyof typeof permitBusRoutes;
      title: string;
      subtitle: string;
    }>
  >(
    () => [
      {
        mode: 'shuttle_bus',
        title: t('School_Bus_Permit_Shuttle_Title'),
        subtitle: t('School_Bus_Permit_Shuttle_Subtitle'),
      },
      {
        mode: 'meet_class_bus',
        title: t('School_Bus_Permit_MeetClass_Title'),
        subtitle: t('School_Bus_Permit_MeetClass_Subtitle'),
      },
    ],
    [t],
  );

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
    permitVariants.findIndex((variant) => variant.mode === selectedBusMode),
  );
  const selectedVariant = permitVariants[selectedIndex] ?? permitVariants[0];
  const cardStageWidth = Math.min(width - 56, 720);
  const carouselGap = 14;
  const carouselSidePadding = Math.max((width - 32 - cardStageWidth) / 2, 0);
  const isPortrait = height > width;
  const fullscreenCardWidth = isPortrait
    ? Math.min(height * 0.92, width * PERMIT_CARD_RATIO * 0.92)
    : Math.min(width * 0.92, height * PERMIT_CARD_RATIO * 0.92);
  const surfaceBodyBackgroundColor = surfaceBodyProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['#faf8f6', '#fff'],
  });

  const scrollToPermit = (modeValue: keyof typeof permitBusRoutes) => {
    const index = permitVariants.findIndex((item) => item.mode === modeValue);
    if (index < 0) return;

    setSelectedBusMode(modeValue);
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
        <PermitHero badge={t('school_bus_permit_title')} title={t('NAV-Permit')} subtitle={desc} />

        <View style={styles.surfaceSection}>
          <Animated.View
            style={[
              styles.surfaceBody,
              !isLargeScreen && styles.surfaceBodyMobile,
              { backgroundColor: surfaceBodyBackgroundColor },
            ]}
          >
            {mode === 'edit' ? (
              <PermitFormSection
                form={form}
                t={t}
                onChangeField={(field, value) =>
                  setForm((prev) => ({
                    ...prev,
                    [field]: field === 'major' ? value.toUpperCase() : value,
                  }))
                }
                onSave={save}
                showCancel={Boolean(saved.name)}
                onCancel={() => {
                  setForm(saved);
                  setMode('view');
                }}
              />
            ) : (
              <PermitPassSection
                t={t}
                form={form}
                selectedBusMode={selectedBusMode}
                selectedVariant={selectedVariant}
                permitVariants={permitVariants}
                cardStageWidth={cardStageWidth}
                carouselGap={carouselGap}
                carouselSidePadding={carouselSidePadding}
                carouselRef={carouselRef}
                scrollToPermit={scrollToPermit}
                setSelectedBusMode={setSelectedBusMode}
                onOpenFullscreen={setFullscreenBusMode}
                onEdit={() => setMode('edit')}
              />
            )}
          </Animated.View>
        </View>
      </View>

      <PermitFullscreenModal
        visibleBusMode={fullscreenBusMode}
        permit={form}
        fullscreenCardWidth={fullscreenCardWidth}
        isPortrait={isPortrait}
        onClose={() => setFullscreenBusMode(null)}
      />
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
  surfaceSection: {
    flex: 1,
    backgroundColor: '#911f27',
    marginTop: -14,
  },
  surfaceBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: '#faf8f6',
    overflow: 'hidden',
  },
  surfaceBodyMobile: {
    paddingBottom: MOBILE_BOTTOM_NAV_OVERLAP + 16,
  },
});
