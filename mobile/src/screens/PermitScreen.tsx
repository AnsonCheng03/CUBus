import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MOBILE_BOTTOM_NAV_OVERLAP } from '../components/CustomNavBar';
import { PERMIT_CARD_RATIO } from '../components/PermitCard';
import { ScreenContainer } from '../components/ScreenContainer';
import { PermitFormSection } from '../components/permit/PermitFormSection';
import { PermitGenerationView } from '../components/permit/PermitGenerationModal';
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
      busMode: appSettings.schoolBusPermit?.busMode ?? 'shuttle_bus',
    }),
    [appSettings.schoolBusPermit],
  );

  const [form, setForm] = useState(saved);
  const [mode, setMode] = useState<'edit' | 'generating' | 'view'>(
    saved.name ? 'view' : 'edit',
  );
  const [fullscreenBusMode, setFullscreenBusMode] = useState<keyof typeof permitBusRoutes | null>(
    null,
  );
  const [selectedBusMode, setSelectedBusMode] =
    useState<keyof typeof permitBusRoutes>(saved.busMode ?? 'shuttle_bus');
  const carouselRef = useRef<ScrollView>(null);
  const surfaceBodyProgress = useRef(new Animated.Value(saved.name ? 1 : 0)).current;
  const modeTransition = useRef(new Animated.Value(1)).current;

  const transitionToMode = useCallback(
    (nextMode: 'edit' | 'generating' | 'view') => {
      if (mode === nextMode) {
        return;
      }

      modeTransition.stopAnimation();
      Animated.timing(modeTransition, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished) {
          return;
        }

        setMode(nextMode);
        modeTransition.setValue(0);
        Animated.timing(modeTransition, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    },
    [mode, modeTransition],
  );

  useEffect(() => {
    setForm(saved);
    setSelectedBusMode(saved.busMode ?? 'shuttle_bus');
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
    const defaultBusMode = 'shuttle_bus' as const;
    const trimmed: PermitFormValue = {
      name: form.name.trim(),
      sid: form.sid.trim(),
      major: form.major.trim().toUpperCase(),
      expiry: form.expiry.trim(),
      busMode: defaultBusMode,
    };

    if (!trimmed.name || !trimmed.sid || !trimmed.major || !trimmed.expiry) {
      return;
    }

    setAppSettings((prev) => ({ ...prev, schoolBusPermit: trimmed }));
    setForm(trimmed);
    setSelectedBusMode(defaultBusMode);
    transitionToMode('generating');
  };

  const finishGeneration = useCallback(() => {
    transitionToMode('view');
  }, [transitionToMode]);

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
  const modeTranslateY = modeTransition.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
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
    <>
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
              <Animated.View
                style={[
                  styles.modeContent,
                  {
                    opacity: modeTransition,
                    transform: [{ translateY: modeTranslateY }],
                  },
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
                      setSelectedBusMode(saved.busMode ?? 'shuttle_bus');
                      transitionToMode('view');
                    }}
                  />
                ) : mode === 'generating' ? (
                  <PermitGenerationView
                    permit={form}
                    busMode={selectedBusMode}
                    onComplete={finishGeneration}
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
                    onEdit={() => transitionToMode('edit')}
                  />
                )}
              </Animated.View>
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

    </>
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
    paddingBottom: MOBILE_BOTTOM_NAV_OVERLAP,
  },
  modeContent: {
    flex: 1,
  },
});
