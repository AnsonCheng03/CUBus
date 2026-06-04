import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
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

  const renderStation = (station: string, index: number, completed: boolean) => {
    const isCurrent = index === currentIndex;
    const isLast = index === route.length - 1;

    return (
      <View key={`${station}-${index}`} style={styles.stationWrapper}>
        {!isLast ? <View style={[styles.connector, completed && styles.connectorCompleted]} /> : null}
        <View style={styles.stationRow}>
          <View style={styles.iconSlot}>
            {isCurrent ? (
              <Ionicons name="bus" size={20} color="#fff" style={styles.busIcon} />
            ) : isLast ? (
              <Ionicons name="flag" size={20} color="#911f27" style={styles.flagIcon} />
            ) : null}
            <View
              style={[
                styles.stationDot,
                completed && styles.stationDotCompleted,
                isCurrent && styles.stationDotCurrent,
              ]}
            />
          </View>
          <Text style={[styles.stationText, completed && styles.stationTextCompleted]}>{station}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={route.length > 0} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('modal-map-title')}</Text>
              <Pressable onPress={onClose}>
                <Text style={styles.close}>Close</Text>
              </Pressable>
            </View>
            <View style={styles.detailContainer}>
              <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.mapGroup, styles.completedGroup]}>
                  {route
                    .slice(0, Math.max(0, currentIndex))
                    .map((station, index) => renderStation(station, index, true))}
                </View>
                <View style={styles.mapGroup}>
                  {route
                    .slice(Math.max(0, currentIndex))
                    .map((station, offset) =>
                      renderStation(station, offset + Math.max(0, currentIndex), false),
                    )}
                </View>
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(50, 50, 50, 0.77)',
  },
  backdrop: {
    flex: 1,
  },
  safeArea: {
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
    paddingBottom: 20,
  },
  scroll: {
    maxHeight: 420,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  mapGroup: {
    position: 'relative',
    paddingLeft: 0,
  },
  completedGroup: {
    opacity: 1,
  },
  stationWrapper: {
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    left: 16.5,
    top: 40,
    bottom: 0,
    width: 7,
    borderRadius: 5,
    backgroundColor: '#630a10',
  },
  connectorCompleted: {
    backgroundColor: '#aaa',
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSlot: {
    width: 30,
    alignItems: 'center',
    marginRight: 4,
  },
  busIcon: {
    backgroundColor: '#630a10',
    borderRadius: 999,
    padding: 10,
    overflow: 'hidden',
    marginBottom: 6,
  },
  flagIcon: {
    backgroundColor: '#fff',
    borderRadius: 999,
    padding: 10,
    overflow: 'hidden',
    marginBottom: 6,
  },
  stationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#630a10',
    backgroundColor: '#fff',
    position: 'absolute',
    top: 28,
  },
  stationDotCompleted: {
    borderColor: '#aaa',
  },
  stationDotCurrent: {
    backgroundColor: '#fff149',
  },
  stationText: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    paddingVertical: 25,
    paddingLeft: 35,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#efefef',
  },
  stationTextCompleted: {
    color: '#aaa',
  },
});
