import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RouteMapSelection } from '../../../src/shared-core/app/types';

export function RouteMapModal({
  routeMap,
  onClose,
}: {
  routeMap: RouteMapSelection | null;
  onClose: () => void;
}) {
  const { t } = useTranslation('global');
  const route = routeMap?.route ?? [];
  const currentIndex = routeMap?.currentIndex ?? -1;

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
                <View style={styles.stationRail}>
                  <View
                    style={[
                      styles.stationMarker,
                      isCompleted && styles.stationMarkerCompleted,
                      isCurrent && styles.stationMarkerCurrent,
                    ]}
                  >
                    {isCurrent ? (
                      <Ionicons name="bus" size={16} color="#fff" />
                    ) : route.length - 1 === index ? (
                      <Ionicons name="flag" size={14} color={isCompleted ? '#dbeee8' : '#21463e'} />
                    ) : (
                      <Text style={[styles.stationIndex, isCompleted && styles.stationIndexCompleted]}>
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  {index < route.length - 1 ? <View style={[styles.stationLine, isCompleted && styles.stationLineCompleted]} /> : null}
                </View>
                <View style={styles.stationBody}>
                  <Text style={[styles.stationStatus, isCurrent && styles.stationStatusCurrent]}>
                    {isCurrent
                      ? t('next-station')
                      : isCompleted
                        ? 'Passed stop'
                        : route.length - 1 === index
                          ? 'Terminal'
                          : 'Upcoming stop'}
                  </Text>
                  <Text style={styles.stationText}>{station}</Text>
                </View>
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
    gap: 4,
  },
  stationRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  stationRail: {
    alignItems: 'center',
  },
  stationMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#ddd5c4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationMarkerCompleted: {
    backgroundColor: '#6c8d84',
    borderColor: '#6c8d84',
  },
  stationMarkerCurrent: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  stationLine: {
    width: 3,
    flex: 1,
    minHeight: 36,
    marginVertical: 4,
    borderRadius: 999,
    backgroundColor: '#ddd5c4',
  },
  stationLineCompleted: {
    backgroundColor: '#6c8d84',
  },
  stationBody: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#fffdf8',
    borderWidth: 1,
    borderColor: '#ddd5c4',
    padding: 14,
    gap: 4,
  },
  stationCompleted: {
    opacity: 0.72,
  },
  stationCurrent: {
    opacity: 1,
  },
  stationStatus: {
    color: '#5b6f68',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  stationStatusCurrent: {
    color: '#0f766e',
  },
  stationIndex: {
    color: '#21463e',
    fontWeight: '800',
    fontSize: 12,
  },
  stationIndexCompleted: {
    color: '#dbeee8',
  },
  stationText: {
    flex: 1,
    color: '#21463e',
    lineHeight: 22,
    fontSize: 16,
    fontWeight: '700',
  },
});
