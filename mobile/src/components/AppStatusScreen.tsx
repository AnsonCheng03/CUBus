import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { APP_BRAND_COLOR } from '../lib/layout';

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
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <View style={styles.loadingIconFrame}>
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
              </View>
              <Text style={styles.loadingTitle}>{title}</Text>
              <Text style={styles.loadingHint}>{hint}</Text>
              <ActivityIndicator size="small" color={APP_BRAND_COLOR} style={styles.loadingIndicator} />
            </View>
          </View>
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
  },
  loadingSafeArea: {
    flex: 1,
    backgroundColor: APP_BRAND_COLOR,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 36,
    shadowColor: '#3b0b0f',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  loadingIconFrame: {
    width: 136,
    height: 136,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffaf3',
    borderRadius: 34,
    marginBottom: 22,
  },
  loadingIcon: {
    marginVertical: 0,
  },
  loadingTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
    color: APP_BRAND_COLOR,
  },
  loadingHint: {
    marginTop: 8,
    color: '#7a6c66',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  loadingIndicator: {
    marginTop: 24,
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
