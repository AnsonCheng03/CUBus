import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Asset } from 'expo-asset';
import { SafeAreaInsetsContext, SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { SvgXml } from 'react-native-svg';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
  type PanGestureHandlerStateChangeEvent,
  type PinchGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';

const campusMapImage = require('../../../src/assets/schoolbusmap.svg');

const MAP_ASPECT_RATIO = 841.89 / 595.28;
const MIN_SCALE = 1;
const MAX_SCALE = 5;
const INITIAL_SCALE = 3;
const INITIAL_X_BIAS = 0.42;
const INITIAL_Y_BIAS = 0.58;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampTranslation(translate: number, scaledSize: number, viewportSize: number) {
  if (scaledSize <= viewportSize) {
    return 0;
  }

  const maxOffset = (scaledSize - viewportSize) / 2;
  return clamp(translate, -maxOffset, maxOffset);
}

function getInitialTranslation(
  viewportWidth: number,
  viewportHeight: number,
  contentWidth: number,
  contentHeight: number,
  scale: number,
) {
  const scaledWidth = contentWidth * scale;
  const scaledHeight = contentHeight * scale;
  const overflowX = Math.max(0, scaledWidth - viewportWidth);
  const overflowY = Math.max(0, scaledHeight - viewportHeight);

  return {
    x: clampTranslation(-(INITIAL_X_BIAS - 0.5) * overflowX, scaledWidth, viewportWidth),
    y: clampTranslation(-(INITIAL_Y_BIAS - 0.5) * overflowY, scaledHeight, viewportHeight),
  };
}

export function BusMapModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation('global');
  const insets = useContext(SafeAreaInsetsContext) ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [mapXml, setMapXml] = useState<string | null>(null);
  const panRef = useRef(null);
  const pinchRef = useRef(null);

  const baseScale = useRef(new Animated.Value(INITIAL_SCALE)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const committedTranslateX = useRef(new Animated.Value(0)).current;
  const committedTranslateY = useRef(new Animated.Value(0)).current;
  const panTranslateX = useRef(new Animated.Value(0)).current;
  const panTranslateY = useRef(new Animated.Value(0)).current;

  const currentScaleRef = useRef(INITIAL_SCALE);
  const currentTranslateXRef = useRef(0);
  const currentTranslateYRef = useRef(0);

  const mapWidth = viewportSize.width;
  const mapHeight = mapWidth > 0 ? mapWidth / MAP_ASPECT_RATIO : 0;

  const resetTransform = useCallback(() => {
    if (!viewportSize.width || !viewportSize.height || !mapWidth || !mapHeight) {
      return;
    }

    const initialTranslation = getInitialTranslation(
      viewportSize.width,
      viewportSize.height,
      mapWidth,
      mapHeight,
      INITIAL_SCALE,
    );

    currentScaleRef.current = INITIAL_SCALE;
    currentTranslateXRef.current = initialTranslation.x;
    currentTranslateYRef.current = initialTranslation.y;

    baseScale.setValue(INITIAL_SCALE);
    pinchScale.setValue(1);
    committedTranslateX.setValue(initialTranslation.x);
    committedTranslateY.setValue(initialTranslation.y);
    panTranslateX.setValue(0);
    panTranslateY.setValue(0);
  }, [
    baseScale,
    committedTranslateX,
    committedTranslateY,
    mapHeight,
    mapWidth,
    panTranslateX,
    panTranslateY,
    pinchScale,
    viewportSize.height,
    viewportSize.width,
  ]);

  useEffect(() => {
    let cancelled = false;

    Asset.loadAsync(campusMapImage)
      .then(([asset]) => {
        const uri = asset.localUri ?? asset.uri;
        return fetch(uri).then((response) => response.text());
      })
      .then((xml) => {
        if (!cancelled) {
          setMapXml(xml);
        }
      })
      .catch((error) => {
        console.warn('[bus-map] unable to load bus map svg', error);
        if (!cancelled) {
          setMapXml(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (visible) {
      resetTransform();
    }
  }, [resetTransform, visible]);

  const onPinchGestureEvent = useMemo(
    () =>
      Animated.event([{ nativeEvent: { scale: pinchScale } }], {
        useNativeDriver: true,
      }),
    [pinchScale],
  );

  const onPanGestureEvent = useMemo(
    () =>
      Animated.event(
        [{ nativeEvent: { translationX: panTranslateX, translationY: panTranslateY } }],
        {
          useNativeDriver: true,
        },
      ),
    [panTranslateX, panTranslateY],
  );

  const handlePinchStateChange = (event: PinchGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState !== State.ACTIVE || !mapWidth || !mapHeight) {
      return;
    }

    const nextScale = clamp(
      currentScaleRef.current * event.nativeEvent.scale,
      MIN_SCALE,
      MAX_SCALE,
    );
    const scaledWidth = mapWidth * nextScale;
    const scaledHeight = mapHeight * nextScale;
    const nextTranslateX = clampTranslation(
      currentTranslateXRef.current,
      scaledWidth,
      viewportSize.width,
    );
    const nextTranslateY = clampTranslation(
      currentTranslateYRef.current,
      scaledHeight,
      viewportSize.height,
    );

    currentScaleRef.current = nextScale;
    currentTranslateXRef.current = nextTranslateX;
    currentTranslateYRef.current = nextTranslateY;

    baseScale.setValue(nextScale);
    pinchScale.setValue(1);
    committedTranslateX.setValue(nextTranslateX);
    committedTranslateY.setValue(nextTranslateY);
    panTranslateX.setValue(0);
    panTranslateY.setValue(0);
  };

  const handlePanStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState !== State.ACTIVE || !mapWidth || !mapHeight) {
      return;
    }

    const scaledWidth = mapWidth * currentScaleRef.current;
    const scaledHeight = mapHeight * currentScaleRef.current;
    const nextTranslateX = clampTranslation(
      currentTranslateXRef.current + event.nativeEvent.translationX,
      scaledWidth,
      viewportSize.width,
    );
    const nextTranslateY = clampTranslation(
      currentTranslateYRef.current + event.nativeEvent.translationY,
      scaledHeight,
      viewportSize.height,
    );

    currentTranslateXRef.current = nextTranslateX;
    currentTranslateYRef.current = nextTranslateY;

    committedTranslateX.setValue(nextTranslateX);
    committedTranslateY.setValue(nextTranslateY);
    panTranslateX.setValue(0);
    panTranslateY.setValue(0);
  };

  const animatedMapStyle = {
    transform: [
      {
        scale: Animated.multiply(baseScale, pinchScale),
      },
      {
        translateX: Animated.add(committedTranslateX, panTranslateX),
      },
      {
        translateY: Animated.add(committedTranslateY, panTranslateY),
      },
    ],
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{t('bus_map_page')}</Text>
          <Text style={styles.subtitle}>{t('modal-map-title')}</Text>
        </View>
        <Pressable onPress={onClose}>
          <Text style={styles.close}>{t('toast_dismiss')}</Text>
        </Pressable>
      </View>

      <GestureHandlerRootView style={styles.gestureRoot}>
        <View style={styles.content}>
          <View
            style={styles.mapCard}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setViewportSize((current) =>
                current.width === width && current.height === height ? current : { width, height },
              );
            }}
          >
            <PanGestureHandler
              ref={panRef}
              simultaneousHandlers={pinchRef}
              minDist={5}
              onGestureEvent={onPanGestureEvent}
              onHandlerStateChange={handlePanStateChange}
            >
              <Animated.View style={styles.mapViewport}>
                <PinchGestureHandler
                  ref={pinchRef}
                  simultaneousHandlers={panRef}
                  onGestureEvent={onPinchGestureEvent}
                  onHandlerStateChange={handlePinchStateChange}
                >
                  <Animated.View
                    style={[
                      styles.mapInner,
                      {
                        width: mapWidth || undefined,
                        height: mapHeight || undefined,
                      },
                      animatedMapStyle,
                    ]}
                  >
                    {mapWidth > 0 && mapHeight > 0 && mapXml ? (
                      <SvgXml xml={mapXml} width={mapWidth} height={mapHeight} />
                    ) : null}
                  </Animated.View>
                </PinchGestureHandler>
              </Animated.View>
            </PanGestureHandler>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f1ed',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#7a6c66',
  },
  close: {
    color: '#630a10',
    fontWeight: '700',
    paddingTop: 4,
  },
  gestureRoot: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  mapCard: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  mapViewport: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
