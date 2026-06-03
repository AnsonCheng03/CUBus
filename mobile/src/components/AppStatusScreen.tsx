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
    <SafeAreaView style={styles.safeArea}>
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
    backgroundColor: '#f3efe4',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#173f35',
    textAlign: 'center',
  },
  hint: {
    color: '#4a5f58',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  body: {
    width: '100%',
    maxWidth: 360,
    marginTop: 8,
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
    marginTop: 8,
  },
  button: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#0f766e',
  },
  secondaryButton: {
    backgroundColor: '#efe8d8',
  },
  buttonText: {
    fontWeight: '800',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#21463e',
  },
});
