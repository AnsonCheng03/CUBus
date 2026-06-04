import React, { useContext } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext, SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const campusMapImage = require('../../../src/assets/map.jpg');

export function BusMapModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTranslation('global');
  const insets = useContext(SafeAreaInsetsContext) ?? { top: 0, bottom: 0, left: 0, right: 0 };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
          <Text style={styles.title}>{t('bus_map_page')}</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
          maximumZoomScale={3}
          minimumZoomScale={1}
        >
          <Image source={campusMapImage} style={styles.mapImage} resizeMode="contain" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  close: {
    color: '#666',
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 0,
  },
  mapImage: {
    width: '100%',
    height: 700,
    backgroundColor: '#fff',
  },
});
