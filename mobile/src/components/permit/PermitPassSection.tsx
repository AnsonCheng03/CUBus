import React from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PermitCard, PERMIT_CARD_RATIO } from '../PermitCard';
import { permitBusRoutes } from '../../lib/permit';
import type { PermitFormValue } from '../../types/mobile';

type PermitVariant = {
  mode: keyof typeof permitBusRoutes;
  title: string;
  subtitle: string;
};

export function PermitPassSection({
  t,
  form,
  selectedBusMode,
  selectedVariant,
  permitVariants,
  cardStageWidth,
  carouselGap,
  carouselSidePadding,
  carouselRef,
  scrollToPermit,
  setSelectedBusMode,
  onOpenFullscreen,
  onEdit,
}: {
  t: (key: string) => string;
  form: PermitFormValue;
  selectedBusMode: keyof typeof permitBusRoutes;
  selectedVariant: PermitVariant;
  permitVariants: PermitVariant[];
  cardStageWidth: number;
  carouselGap: number;
  carouselSidePadding: number;
  carouselRef: React.RefObject<ScrollView>;
  scrollToPermit: (mode: keyof typeof permitBusRoutes) => void;
  setSelectedBusMode: (mode: keyof typeof permitBusRoutes) => void;
  onOpenFullscreen: (mode: keyof typeof permitBusRoutes) => void;
  onEdit: () => void;
}) {
  return (
    <ScrollView
      style={styles.viewPage}
      contentContainerStyle={styles.viewPageContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.passStageCard}>
        <View style={styles.passStageMeta}>
          <Text style={styles.passStageTitle}>{selectedVariant.title}</Text>
        </View>

        <View style={[styles.passViewport, { minHeight: cardStageWidth / PERMIT_CARD_RATIO + 18 }]}>
          <ScrollView
            ref={carouselRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            disableIntervalMomentum
            pagingEnabled={false}
            snapToInterval={cardStageWidth + carouselGap}
            snapToAlignment="start"
            bounces={true}
            contentContainerStyle={[
              styles.passCarouselContent,
              { paddingHorizontal: carouselSidePadding },
            ]}
            onScrollEndDrag={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / (cardStageWidth + carouselGap),
              );
              const clampedIndex = Math.max(0, Math.min(index, permitVariants.length - 1));
              scrollToPermit(permitVariants[clampedIndex].mode);
            }}
            onMomentumScrollEnd={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / (cardStageWidth + carouselGap),
              );
              const nextMode = permitVariants[index]?.mode ?? selectedBusMode;
              setSelectedBusMode(nextMode);
            }}
          >
            {permitVariants.map((variant, index) => (
              <View
                key={variant.mode}
                style={[
                  styles.passCarouselItem,
                  {
                    width: cardStageWidth,
                    marginRight: index === permitVariants.length - 1 ? 0 : carouselGap,
                  },
                ]}
              >
                <PermitCard
                  permit={form}
                  busMode={variant.mode}
                  targetWidth={cardStageWidth}
                  onPress={() => onOpenFullscreen(variant.mode)}
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
          {permitVariants.map((variant) => {
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
        <Pressable style={styles.primaryButton} onPress={onEdit}>
          <Text style={styles.primaryButtonText}>{t('Permit_Edit')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  viewPage: {
    flex: 1,
  },
  viewPageContent: {
    flexGrow: 1,
    gap: 12,
    paddingBottom: 24,
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
});
