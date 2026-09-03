import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const appIcon = require('../assets/bus.jpg');

export function AppStatusScreen({
  title,
  hint,
  body,
  loading = false,
  fadeOut = false,
  onFadeOutComplete,
  actions = [],
}: {
  title: string;
  hint: string;
  body?: React.ReactNode;
  loading?: boolean;
  fadeOut?: boolean;
  onFadeOutComplete?: () => void;
  actions?: Array<{
    label: string;
    onPress: () => void;
    tone?: 'primary' | 'secondary';
  }>;
}) {
  const jumpProgress = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(1)).current;
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (!loading) {
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(jumpProgress, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(jumpProgress, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [jumpProgress, loading]);

  useEffect(() => {
    if (loading && !fadeOut) {
      loadingOpacity.setValue(1);
    }
  }, [fadeOut, loading, loadingOpacity]);

  useEffect(() => {
    if (!loading || !fadeOut) {
      return;
    }

    const animation = Animated.timing(loadingOpacity, {
      toValue: 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished) {
        onFadeOutComplete?.();
      }
    });

    return () => animation.stop();
  }, [fadeOut, loading, loadingOpacity, onFadeOutComplete]);

  if (loading) {
    const iconSize = Math.min(136, Math.max(104, Math.min(width, height) * 0.2));

    return (
      <Animated.View style={[styles.loadingLayer, { opacity: loadingOpacity }]}>
        <SafeAreaView style={styles.loadingSafeArea} edges={['top', 'bottom']}>
          <Animated.Image
            source={appIcon}
            resizeMode="contain"
            style={[
              styles.loadingIcon,
              {
                width: iconSize,
                height: iconSize,
                transform: [
                  {
                    translateY: jumpProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10],
                    }),
                  },
                ],
              },
            ]}
          />
        </SafeAreaView>
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.hint}>{hint}</Text>
        {body ? <View style={styles.body}>{body}</View> : null}
        {actions.length > 0 ? (
          <View style={styles.actions}>
            {actions.map((action) => (
              <Pressable
                key={action.label}
                style={[
                  styles.button,
                  action.tone === 'secondary' ? styles.secondaryButton : styles.primaryButton,
                ]}
                onPress={action.onPress}
              >
                <Text
                  style={[
                    styles.buttonText,
                    action.tone === 'secondary' ? styles.secondaryButtonText : styles.primaryButtonText,
                  ]}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingLayer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingSafeArea: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    marginVertical: 0,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#d6a16e',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#630a10',
    textAlign: 'center',
  },
  hint: {
    color: 'rgba(99, 10, 16, 0.78)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  body: {
    width: '100%',
    marginTop: 8,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#630a10',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d6d6d6',
  },
  buttonText: {
    fontWeight: '700',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#333',
  },
});
