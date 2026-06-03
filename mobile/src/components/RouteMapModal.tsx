import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

export function RouteMapModal({ routeMap, onClose }: { routeMap: any[]; onClose: () => void }) {
  const { t } = useTranslation('global');
  const route = routeMap?.[0] ?? [];
  const currentIndex = routeMap?.[1] ?? -1;

  return (
    <Modal visible={route.length > 0} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('modal-map-title')}</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {route.map((station: string, index: number) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <View
                key={`${station}-${index}`}
                style={[
                  styles.stationRow,
                  isCompleted && styles.stationCompleted,
                  isCurrent && styles.stationCurrent,
                ]}
              >
                <Text style={styles.stationIndex}>{index + 1}</Text>
                <Text style={styles.stationText}>{station}</Text>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3efe4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#183a33',
  },
  close: {
    color: '#0f766e',
    fontWeight: '700',
  },
  content: {
    padding: 20,
    gap: 10,
  },
  stationRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#ddd5c4',
  },
  stationCompleted: {
    opacity: 0.55,
  },
  stationCurrent: {
    borderColor: '#0f766e',
    backgroundColor: '#e8f6f2',
  },
  stationIndex: {
    width: 22,
    color: '#0f766e',
    fontWeight: '800',
  },
  stationText: {
    flex: 1,
    color: '#21463e',
    lineHeight: 22,
  },
});
