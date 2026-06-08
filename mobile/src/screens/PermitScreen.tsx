import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
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
  const surfaceBodyBackgroundColor = surfaceBodyProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.82)', '#fff'],
  });

  const scrollToPermit = (modeValue: keyof typeof permitBusRoutes) => {
    const index = PERMIT_VARIANTS.findIndex((item) => item.mode === modeValue);
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
        <PermitHero
          badge={t('school_bus_permit_title')}
          title={t('NAV-Permit')}
          subtitle={desc}
        />

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
                permitVariants={PERMIT_VARIANTS}
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
    paddingBottom: MOBILE_BOTTOM_NAV_OVERLAP + 40,
  },
});
