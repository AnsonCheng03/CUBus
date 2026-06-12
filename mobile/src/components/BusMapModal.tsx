import React, { useContext } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaInsetsContext, SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const campusMapImage = require('../../../src/assets/schbus_l.png');

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
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{t('bus_map_page')}</Text>
            <Text style={styles.subtitle}>{t('modal-map-title')}</Text>
          </View>
          <Pressable onPress={onClose}>
            <Text style={styles.close}>{t('toast_dismiss')}</Text>
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
          <View style={styles.mapCard}>
            <Image source={campusMapImage} style={styles.mapImage} resizeMode="contain" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f1ed',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#7a6c66',
  },
  close: {
    color: '#630a10',
    fontWeight: '700',
    paddingTop: 4,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  mapCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8dfd8',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  mapImage: {
    width: '100%',
    height: 460,
    backgroundColor: '#fff',
  },
});
