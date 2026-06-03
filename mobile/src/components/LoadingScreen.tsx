import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function LoadingScreen({ hint }: { hint: string }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.title}>CU Bus</Text>
        <Text style={styles.hint}>{hint}</Text>
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
  },
  hint: {
    color: '#4a5f58',
    fontSize: 16,
    textAlign: 'center',
  },
});
