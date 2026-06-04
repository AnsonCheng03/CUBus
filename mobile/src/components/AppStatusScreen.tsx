import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {loading ? <ActivityIndicator size="large" color="#0f766e" /> : null}
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
    backgroundColor: '#f2f2f2',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
  },
  hint: {
    color: '#666',
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
