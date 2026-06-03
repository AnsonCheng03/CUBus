import React from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const campusMapImage = require('../../../src/assets/map.jpg');

export function BusMapModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation('global');

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('bus_map_page')}</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          maximumZoomScale={3}
          minimumZoomScale={1}
        >
          <Text style={styles.subtitle}>
            Explore the campus shuttle area map and pinch to inspect stops and pathways more closely.
          </Text>
          <Image source={campusMapImage} style={styles.mapImage} resizeMode="contain" />
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 14,
  },
  subtitle: {
    color: '#5a6c65',
    lineHeight: 22,
  },
  mapImage: {
    width: '100%',
    height: 520,
    borderRadius: 22,
    backgroundColor: '#fffdf8',
  },
});
