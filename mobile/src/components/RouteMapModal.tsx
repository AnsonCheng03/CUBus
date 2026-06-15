import React, { useContext, useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaInsetsContext, SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { RouteMapSelection } from '../shared-core/app/types';

type SheetAnimationMode = 'fade' | 'slide-bottom';

const BACKDROP_ANIMATION_MS = 220;
const SHEET_ANIMATION_MS = 260;
const SHEET_OFFSCREEN_Y = 420;
const TIMELINE_RAIL_LEFT = 15;
const TIMELINE_RAIL_WIDTH = 5;
const TIMELINE_DOT_INNER_SIZE = 12;
const TIMELINE_DOT_BORDER = 3;
const TIMELINE_DOT_SIZE = TIMELINE_DOT_INNER_SIZE + TIMELINE_DOT_BORDER * 2;
const TIMELINE_MARKER_LEFT = -12;
const TIMELINE_MARKER_TOP = 25;
const TIMELINE_MARKER_CENTER_Y = TIMELINE_MARKER_TOP + TIMELINE_DOT_SIZE / 2;
const TIMELINE_RAIL_TOP = TIMELINE_MARKER_CENTER_Y / 2;
const TIMELINE_RAIL_BOTTOM_OFFSET = 70;
const TIMELINE_ICON_LEFT = -22;
const TIMELINE_ICON_TOP = 14;
const TIMELINE_ICON_SIZE = 40;

export function RouteMapModal({
  routeMap,
  onClose,
  sheetAnimation = 'slide-bottom',
}: {
  routeMap: RouteMapSelection | null;
  onClose: () => void;
  sheetAnimation?: SheetAnimationMode;
}) {
  const { t } = useTranslation('global');
  const insets = useContext(SafeAreaInsetsContext) ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const visible = (routeMap?.route?.length ?? 0) > 0;
  const [renderedRouteMap, setRenderedRouteMap] = useState<RouteMapSelection | null>(routeMap);
  const [isMounted, setIsMounted] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const sheetProgress = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const route = renderedRouteMap?.route ?? [];
  const currentIndex = renderedRouteMap?.currentIndex ?? -1;

  useEffect(() => {
    if (visible) {
      setRenderedRouteMap(routeMap);
      setIsMounted(true);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: BACKDROP_ANIMATION_MS,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sheetProgress, {
          toValue: 1,
          duration: SHEET_ANIMATION_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: BACKDROP_ANIMATION_MS,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(sheetProgress, {
        toValue: 0,
        duration: SHEET_ANIMATION_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMounted(false);
      setRenderedRouteMap(null);
    });
  }, [backdropOpacity, routeMap, sheetProgress, visible]);

  if (!isMounted) {
    return null;
  }

  const sheetAnimatedStyle =
    sheetAnimation === 'fade'
      ? {
          opacity: sheetProgress,
        }
      : {
          transform: [
            {
              translateY: sheetProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [SHEET_OFFSCREEN_Y, 0],
              }),
            },
          ],
        };

  const renderStation = (station: string, index: number, completed: boolean) => {
    const isCurrent = index === currentIndex;
    const isLast = index === route.length - 1;

    return (
      <View key={`${station}-${index}`} style={styles.stationWrapper}>
        <View style={styles.stationContainer}>
          {!isCurrent && !isLast ? (
            <View
              style={[
                styles.stationTextMarker,
                completed && styles.stationTextMarkerCompleted,
                isCurrent && styles.stationTextMarkerCurrent,
              ]}
            />
          ) : null}
          {isCurrent ? (
            <View style={styles.busIconMarker}>
              <Ionicons name="bus" size={20} color="#fff" style={styles.busIcon} />
            </View>
          ) : isLast ? (
            <View style={styles.flagIconMarker}>
              <Ionicons name="flag" size={20} color="#911f27" style={styles.flagIcon} />
            </View>
          ) : null}
          <Text
            style={[styles.stationText, completed && styles.stationTextCompleted]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {station}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <SafeAreaView style={styles.modalRoot} edges={['top']}>
        <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
          <Pressable style={styles.backdrop} onPress={onClose} />
        </Animated.View>
        <View style={styles.safeArea}>
          <Animated.View
            style={[
              styles.sheet,
              sheetAnimatedStyle,
              { paddingBottom: Math.max(insets.bottom, 0) },
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.title}>{t('modal-map-title')}</Text>
              <Pressable onPress={onClose}>
                <Text style={styles.close}>{t('toast_dismiss')}</Text>
              </Pressable>
            </View>
            <View style={styles.detailContainer}>
              <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.mapGroup, styles.mapGroupCompleted]}>
                  {currentIndex > 0 ? (
                    <View style={[styles.mapGroupRail, styles.mapGroupRailCompleted]} />
                  ) : null}
                  {route
                    .slice(0, Math.max(0, currentIndex))
                    .map((station, index) => renderStation(station, index, true))}
                </View>
                <View style={styles.mapGroup}>
                  {route.length - Math.max(0, currentIndex) > 1 ? (
                    <View style={styles.mapGroupRail} />
                  ) : null}
                  {route
                    .slice(Math.max(0, currentIndex))
                    .map((station, offset) =>
                      renderStation(station, offset + Math.max(0, currentIndex), false),
                    )}
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(50, 50, 50, 0.77)',
  },
  backdrop: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '72%',
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 30,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 84,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
  close: {
    color: '#666',
    fontSize: 16,
  },
  detailContainer: {
    width: '100%',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  scroll: {
    maxHeight: 420,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  mapGroup: {
    position: 'relative',
    paddingHorizontal: 20,
  },
  mapGroupCompleted: {
    paddingBottom: 0,
  },
  stationWrapper: {
    position: 'relative',
  },
  stationContainer: {
    position: 'relative',
  },
  mapGroupRail: {
    position: 'absolute',
    left: TIMELINE_RAIL_LEFT,
    top: TIMELINE_RAIL_TOP,
    bottom: TIMELINE_RAIL_BOTTOM_OFFSET,
    width: TIMELINE_RAIL_WIDTH,
    borderRadius: 5,
    backgroundColor: '#630a10',
  },
  mapGroupRailCompleted: {
    backgroundColor: '#aaa',
    top: TIMELINE_MARKER_CENTER_Y,
    bottom: -TIMELINE_MARKER_CENTER_Y,
  },
  busIconMarker: {
    position: 'absolute',
    left: TIMELINE_ICON_LEFT,
    top: TIMELINE_ICON_TOP,
    width: TIMELINE_ICON_SIZE,
    height: TIMELINE_ICON_SIZE,
    backgroundColor: '#630a10',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagIconMarker: {
    position: 'absolute',
    left: TIMELINE_ICON_LEFT,
    top: TIMELINE_ICON_TOP,
    width: TIMELINE_ICON_SIZE,
    height: TIMELINE_ICON_SIZE,
    backgroundColor: '#fff',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busIcon: {
    marginLeft: 1,
  },
  flagIcon: {
    marginLeft: 1,
  },
  stationText: {
    fontSize: 18,
    color: '#333',
    paddingVertical: 25,
    paddingLeft: 35,
    flex: 1,
  },
  stationTextCompleted: {
    color: '#aaa',
  },
  stationTextMarker: {
    position: 'absolute',
    left: TIMELINE_MARKER_LEFT,
    top: TIMELINE_MARKER_TOP,
    width: TIMELINE_DOT_SIZE,
    height: TIMELINE_DOT_SIZE,
    borderRadius: TIMELINE_DOT_SIZE / 2,
    borderWidth: TIMELINE_DOT_BORDER,
    borderColor: '#630a10',
    backgroundColor: '#fff',
  },
  stationTextMarkerCompleted: {
    borderColor: '#aaa',
  },
  stationTextMarkerCurrent: {
    backgroundColor: '#fff149',
  },
});
