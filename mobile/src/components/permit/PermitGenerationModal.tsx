import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { PermitCard, PERMIT_CARD_RATIO } from '../PermitCard';
import { APP_BRAND_COLOR } from '../../lib/layout';
import { permitBusRoutes } from '../../lib/permit';
import type { PermitFormValue } from '../../types/mobile';

type PermitBusMode = keyof typeof permitBusRoutes;
const permitAppIcon = require('../../assets/bus.png');

const PASSENGER_NOTICES = [
  {
    zh: '落車前請按鐘；如未能按鐘，請預先通知車長。',
    en: 'Ring the bell before alighting. If unable to do so, notify the driver in advance.',
  },
  {
    zh: '車輛停定前請留在座位或握穩扶手，上落車時請依序而行。',
    en: 'Remain seated or hold a handrail until the bus stops, and board or alight in order.',
  },
  {
    zh: '請優先讓座予有需要人士，並避免滋擾其他乘客。',
    en: 'Offer priority seats to passengers in need and avoid disturbing others.',
  },
  {
    zh: '請保持車門及通道暢通，並保持車廂清潔。',
    en: 'Keep doors and aisles clear, and keep the bus clean.',
  },
  {
    zh: '本證為非官方創作，不代表乘車資格或身份證明；乘車時須出示有效證件。',
    en: 'This unofficial permit does not establish travel eligibility or identity. Valid identification is required.',
  },
];

function PermitBackCard({ targetWidth }: { targetWidth: number }) {
  const scale = targetWidth / 560;
  const targetHeight = targetWidth / PERMIT_CARD_RATIO;

  return (
    <View
      style={[
        styles.backCard,
        {
          width: targetWidth,
          height: targetHeight,
          borderRadius: 20 * scale,
          paddingTop: 20 * scale,
          paddingRight: 27 * scale,
          paddingBottom: 16 * scale,
          paddingLeft: 27 * scale,
        },
      ]}
    >
      <View style={[styles.termsAccent, { width: 9 * scale }]} />
      <View
        style={[
          styles.termsHeader,
          {
            gap: 11 * scale,
            paddingBottom: 9 * scale,
            borderBottomWidth: 1,
          },
        ]}
      >
        <Image
          source={permitAppIcon}
          resizeMode="cover"
          style={[
            styles.termsMonogram,
            {
              width: 35 * scale,
              height: 35 * scale,
              borderRadius: 10 * scale,
            },
          ]}
        />
        <View style={[styles.termsHeaderCopy, { gap: 1 * scale }]}>
          <Text style={[styles.termsTitle, { fontSize: 17 * scale }]}>乘車須知</Text>
          <Text style={[styles.termsSubtitle, { fontSize: 8 * scale }]}>Passenger Notice</Text>
        </View>
        <View
          style={[
            styles.termsStatus,
            {
              paddingHorizontal: 9 * scale,
              paddingVertical: 6 * scale,
              borderRadius: 999,
            },
          ]}
        >
          <Text style={[styles.termsStatusText, { fontSize: 7 * scale }]}>非官方 · Unofficial</Text>
        </View>
      </View>

      <View style={[styles.termsList, { marginTop: 10 * scale }]}>
        {PASSENGER_NOTICES.map((notice, index) => (
          <View
            key={notice.zh}
            style={[
              styles.termsItem,
              {
                paddingTop: 3 * scale,
                paddingRight: 3 * scale,
                paddingBottom: 3 * scale,
                paddingLeft: 5 * scale,
                borderBottomWidth: index === PASSENGER_NOTICES.length - 1 ? 0 : 1,
              },
            ]}
          >
            <Text style={[styles.termsMarker, { width: 13 * scale, fontSize: 8 * scale }]}>
              {index + 1}.
            </Text>
            <View style={styles.termsItemCopy}>
              <Text style={[styles.termsZh, { fontSize: 8 * scale, lineHeight: 10.8 * scale }]}>
                {notice.zh}
              </Text>
              <Text style={[styles.termsEn, { fontSize: 7.2 * scale, lineHeight: 9.2 * scale }]}>
                {notice.en}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.termsFooter, { gap: 8 * scale, paddingTop: 7 * scale }]}>
        <Text style={[styles.termsFooterText, { fontSize: 7 * scale }]}>FOR ENTERTAINMENT ONLY</Text>
        <Text style={[styles.termsFooterText, { fontSize: 7 * scale }]}>僅供娛樂用途</Text>
      </View>
    </View>
  );
}

export function PermitGenerationView({
  permit,
  busMode,
  onComplete,
}: {
  permit: PermitFormValue;
  busMode: PermitBusMode;
  onComplete: () => void;
}) {
  const { width } = useWindowDimensions();
  const [isPainting, setIsPainting] = useState(false);
  const reveal = useRef(new Animated.Value(0)).current;
  const flip = useRef(new Animated.Value(0)).current;
  const shine = useRef(new Animated.Value(0)).current;
  const split = useRef(new Animated.Value(0)).current;
  const activeAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsPainting(false);
    reveal.setValue(0);
    flip.setValue(0);
    shine.setValue(0);
    split.setValue(0);

    const runAnimations = (animations: Animated.CompositeAnimation[]) =>
      new Promise<boolean>((resolve) => {
        const animation = Animated.parallel(animations);
        activeAnimation.current = animation;
        animation.start(({ finished }) => {
          if (activeAnimation.current === animation) {
            activeAnimation.current = null;
          }
          resolve(Boolean(finished) && !cancelled);
        });
      });

    const animate = (value: Animated.Value, toValue: number, duration: number) =>
      runAnimations([
        Animated.timing(value, {
          toValue,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]);

    const pause = (duration: number) =>
      new Promise<boolean>((resolve) => {
        timer.current = setTimeout(() => {
          timer.current = null;
          resolve(!cancelled);
        }, duration);
      });

    const generate = async () => {
      if (!(await pause(850)) || cancelled) return;

      setIsPainting(true);
      if (!(await animate(reveal, 1, 2300)) || cancelled) {
        return;
      }

      setIsPainting(false);
      if (!(await pause(420)) || cancelled) return;
      if (!(await animate(flip, 1, 720)) || cancelled) return;
      if (!(await pause(650)) || cancelled) return;
      if (!(await animate(flip, 0, 720)) || cancelled) return;
      if (
        !(await runAnimations([
          Animated.sequence([
            Animated.timing(shine, {
              toValue: 1,
              duration: 450,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false,
            }),
            Animated.timing(shine, {
              toValue: 0,
              duration: 450,
              easing: Easing.in(Easing.cubic),
              useNativeDriver: false,
            }),
          ]),
        ])) ||
        cancelled
      ) {
        return;
      }
      if (
        !(await runAnimations([
          Animated.timing(split, {
            toValue: 1,
            duration: 560,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }),
        ])) ||
        cancelled
      ) {
        return;
      }

      await pause(500);
      if (!cancelled) {
        onComplete();
      }
    };

    void generate();

    return () => {
      cancelled = true;
      activeAnimation.current?.stop();
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };
  }, [busMode, flip, onComplete, permit, reveal, shine, split]);

  const cardWidth = Math.min(Math.max(width - 64, 280), 560);
  const cardHeight = cardWidth / PERMIT_CARD_RATIO;
  const maskWidth = reveal.interpolate({
    inputRange: [0, 1],
    outputRange: [cardWidth, 0],
  });
  const brushX = reveal.interpolate({
    inputRange: [0, 1],
    outputRange: [-24, cardWidth - 24],
  });
  const frontRotation = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotation = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  const mainScale = split.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.72],
  });
  const mainTranslateY = split.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -cardHeight * 0.22],
  });
  const splitCardsOpacity = split.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.75, 1],
  });
  const splitCardsTranslateY = split.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 0],
  });
  const shuttleTranslateX = split.interpolate({
    inputRange: [0, 1],
    outputRange: [-cardWidth * 0.18, 0],
  });
  const meetTranslateX = split.interpolate({
    inputRange: [0, 1],
    outputRange: [cardWidth * 0.18, 0],
  });
  const shineX = shine.interpolate({
    inputRange: [0, 1],
    outputRange: [-cardWidth, cardWidth],
  });
  const shineOpacity = shine.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.55, 0],
  });
  const splitCardWidth = Math.min(Math.max((cardWidth - 28) / 2, 120), 250);

  return (
    <View style={styles.safeArea}>
      <View style={styles.theatre}>
        <View style={[styles.cardViewport, { height: Math.max(cardHeight + 112, 330) }]}>
              <Animated.View
                style={[
                  styles.mainCard,
                  {
                    transform: [{ translateY: mainTranslateY }, { scale: mainScale }],
                  },
                ]}
              >
                <View style={[styles.cardObject, { width: cardWidth, height: cardHeight }]}>
                <Animated.View
                  style={[
                    styles.cardFace,
                    {
                      width: cardWidth,
                      height: cardHeight,
                      transform: [{ perspective: 1400 }, { rotateY: frontRotation }],
                    },
                  ]}
                >
                  <PermitCard
                    permit={permit}
                    busMode={busMode}
                    targetWidth={cardWidth}
                    withShadow={false}
                  />
                  <Animated.View
                    pointerEvents="none"
                    style={[styles.paintMask, { width: maskWidth, height: cardHeight }]}
                  />
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.brushHead,
                      {
                        opacity: isPainting ? 0.9 : 0,
                        transform: [{ translateX: brushX }],
                      },
                    ]}
                  />
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.shine,
                      {
                        opacity: shineOpacity,
                        transform: [{ translateX: shineX }, { rotate: '15deg' }],
                      },
                    ]}
                  />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.cardFace,
                    {
                      width: cardWidth,
                      height: cardHeight,
                      transform: [{ perspective: 1400 }, { rotateY: backRotation }],
                    },
                  ]}
                >
                    <PermitBackCard targetWidth={cardWidth} />
                </Animated.View>
                </View>
              </Animated.View>

              <Animated.View
                style={[
                  styles.splitCards,
                  {
                    opacity: splitCardsOpacity,
                    transform: [{ translateY: splitCardsTranslateY }],
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.splitCard,
                    { transform: [{ translateX: shuttleTranslateX }] },
                  ]}
                >
                  <PermitCard
                    permit={permit}
                    busMode="shuttle_bus"
                    targetWidth={splitCardWidth}
                    withShadow={false}
                  />
                </Animated.View>
                <Animated.View
                  style={[styles.splitCard, { transform: [{ translateX: meetTranslateX }] }]}
                >
                  <PermitCard
                    permit={permit}
                    busMode="meet_class_bus"
                    targetWidth={splitCardWidth}
                    withShadow={false}
                  />
                </Animated.View>
              </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#faf8f6',
  },
  theatre: {
    flex: 1,
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#fff',
  },
  cardViewport: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCard: {
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardObject: {
    transform: [{ perspective: 1400 }],
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  paintMask: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#fff',
  },
  brushHead: {
    position: 'absolute',
    top: -8,
    left: 0,
    width: 48,
    height: 16,
    opacity: 0.9,
    borderRadius: 999,
    backgroundColor: APP_BRAND_COLOR,
    shadowColor: APP_BRAND_COLOR,
    shadowOpacity: 0.32,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  shine: {
    position: 'absolute',
    top: -60,
    left: -30,
    width: 60,
    backgroundColor: 'rgba(214,161,110,0.46)',
    shadowColor: '#d6a16e',
    shadowOpacity: 0.42,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  splitCards: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  splitCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backCard: {
    position: 'relative',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(58,20,73,0.16)',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  termsAccent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#431257',
  },
  termsHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#e5dce8',
  },
  termsMonogram: {
    flexGrow: 0,
    flexShrink: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e1d7e4',
    backgroundColor: '#fff',
  },
  termsHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },
  termsTitle: {
    color: '#25122f',
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  termsSubtitle: {
    color: '#7a687f',
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  termsStatus: {
    flexGrow: 0,
    flexShrink: 1,
    borderWidth: 1,
    borderColor: '#d8cadc',
  },
  termsStatusText: {
    color: '#5d4565',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  termsList: {
    flex: 1,
    width: '100%',
    paddingLeft: 18,
    paddingRight: 3,
  },
  termsItem: {
    flexDirection: 'row',
    borderBottomColor: '#ece5ee',
  },
  termsMarker: {
    flexGrow: 0,
    flexShrink: 0,
    color: '#451659',
    fontWeight: '800',
  },
  termsItemCopy: {
    flex: 1,
    minWidth: 0,
  },
  termsZh: {
    color: '#46364b',
  },
  termsEn: {
    marginTop: 2,
    color: '#75637a',
  },
  termsFooter: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5dce8',
  },
  termsFooterText: {
    flexShrink: 1,
    color: '#8b738f',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
