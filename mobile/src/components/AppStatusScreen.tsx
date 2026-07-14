import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProjectLoadingIndicator } from './ProjectLoadingIndicator';

const appIcon = require('../assets/bus.jpg');

export function AppStatusScreen({
  title,
  hint,
  body,
  loading = false,
  actions = [],
}: {
  title: string;
  hint: string;
  body?: React.ReactNode;
  loading?: boolean;
  actions?: Array<{
    label: string;
    onPress: () => void;
    tone?: 'primary' | 'secondary';
  }>;
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingVisuals}>
            <Image source={appIcon} style={styles.appIcon} resizeMode="cover" />
            <ProjectLoadingIndicator size={72} />
          </View>
        ) : null}
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
  loadingVisuals: {
    alignItems: 'center',
    gap: 8,
  },
  appIcon: {
    width: 112,
    height: 112,
    borderRadius: 24,
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
