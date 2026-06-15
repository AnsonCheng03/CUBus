import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';

const busMoving = require('../../assets/busMoving.gif');

const BUS_WIDTH = 60;
const BUS_HEIGHT = 32;
const MOVE_DURATION_MS = 3200;
const EDGE_PAUSE_MS = 500;
const RELEASE_PAUSE_MS = 1000;
const FLIP_DELAY_MS = 500;

export function BusMovingImage() {
  const translateX = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const releaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentXRef = useRef(0);
  const facingRef = useRef<1 | -1>(1);
  const dragStartXRef = useRef(0);
  const dragStartFacingRef = useRef<1 | -1>(1);
  const draggingRef = useRef(false);
  const [trackWidth, setTrackWidth] = useState(0);
  const [facing, setFacing] = useState<1 | -1>(1);

  const travelDistance = useMemo(() => Math.max(trackWidth - BUS_WIDTH, 0), [trackWidth]);

  useEffect(() => {
    const listenerId = translateX.addListener(({ value }) => {
      currentXRef.current = value;
    });

    return () => {
      translateX.removeListener(listenerId);
    };
  }, [translateX]);

  const clearTimers = () => {
    if (releaseTimeoutRef.current) {
      clearTimeout(releaseTimeoutRef.current);
      releaseTimeoutRef.current = null;
    }
    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current);
      flipTimeoutRef.current = null;
    }
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const stopMotion = () => {
    animationRef.current?.stop();
    animationRef.current = null;
  };

  const updateFacing = (nextFacing: 1 | -1) => {
    facingRef.current = nextFacing;
    setFacing(nextFacing);
  };

  const scheduleAutoMove = () => {
    if (travelDistance <= 0 || draggingRef.current) {
      return;
    }

    stopMotion();

    const fromX = currentXRef.current;
    const nextFacing = facingRef.current;
    const targetX = nextFacing === 1 ? travelDistance : 0;
    const distance = Math.abs(targetX - fromX);

    if (distance <= 0.5) {
      resumeTimeoutRef.current = setTimeout(() => {
        updateFacing(nextFacing === 1 ? -1 : 1);
        scheduleAutoMove();
      }, EDGE_PAUSE_MS);
      return;
    }

    const duration = Math.max(180, Math.round((MOVE_DURATION_MS * distance) / travelDistance));
    const motion = Animated.timing(translateX, {
      toValue: targetX,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    animationRef.current = motion;
    motion.start(({ finished }) => {
      if (!finished || draggingRef.current) {
        return;
      }

      resumeTimeoutRef.current = setTimeout(() => {
        updateFacing(nextFacing === 1 ? -1 : 1);
        scheduleAutoMove();
      }, EDGE_PAUSE_MS);
    });
  };

  useEffect(() => {
    if (travelDistance <= 0) {
      clearTimers();
      stopMotion();
      translateX.setValue(0);
      updateFacing(1);
      return;
    }

    scheduleAutoMove();

    return () => {
      clearTimers();
      stopMotion();
    };
  }, [travelDistance, translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 4,
        onPanResponderGrant: () => {
          clearTimers();
          stopMotion();
          draggingRef.current = true;
          dragStartXRef.current = currentXRef.current;
          dragStartFacingRef.current = facingRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const nextX = Math.min(
            Math.max(dragStartXRef.current + gestureState.dx, 0),
            travelDistance,
          );

          translateX.setValue(nextX);

          if (gestureState.dx > 2) {
            updateFacing(-1);
          } else if (gestureState.dx < -2) {
            updateFacing(1);
          }
        },
        onPanResponderRelease: () => {
          draggingRef.current = false;

          releaseTimeoutRef.current = setTimeout(() => {
            const resetFacing = () => {
              scheduleAutoMove();
            };

            if (facingRef.current !== dragStartFacingRef.current) {
              flipTimeoutRef.current = setTimeout(() => {
                updateFacing(dragStartFacingRef.current);
                resumeTimeoutRef.current = setTimeout(resetFacing, FLIP_DELAY_MS);
              }, FLIP_DELAY_MS);
              return;
            }

            resetFacing();
          }, RELEASE_PAUSE_MS);
        },
        onPanResponderTerminate: () => {
          draggingRef.current = false;
          clearTimers();
          scheduleAutoMove();
        },
      }),
    [travelDistance],
  );

  const onLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.busWrapper,
          {
            transform: [{ translateX }, { scaleX: facing }],
          },
        ]}
      >
        <Image source={busMoving} style={styles.busImage} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: BUS_HEIGHT,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  busWrapper: {
    width: BUS_WIDTH,
    height: BUS_HEIGHT,
  },
  busImage: {
    width: '100%',
    height: '100%',
  },
});
