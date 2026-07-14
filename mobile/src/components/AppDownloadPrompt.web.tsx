import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type StorePlatform = 'ios' | 'android' | 'desktop';

const appIcon = require('../../assets/images/icon.png');
const APP_STORE_URL = 'https://apps.apple.com/us/app/cu-bus/id6736944558';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.cubus.app';
const DISMISS_KEY = 'dismissAppStorePrompt';
const DISMISS_WINDOW_MS = 24 * 60 * 60 * 1000;

function wasRecentlyDismissed() {
  const saved = window.localStorage.getItem(DISMISS_KEY);
  if (!saved) return false;
  const timestamp = Date.parse(saved);
  return Number.isFinite(timestamp) && Date.now() - timestamp < DISMISS_WINDOW_MS;
}

function detectStorePlatform(): StorePlatform {
  const userAgent = window.navigator.userAgent;
  if (/Android/i.test(userAgent)) return 'android';
  if (/iPad|iPhone|iPod/i.test(userAgent)) return 'ios';
  if (/Macintosh/i.test(userAgent) && window.navigator.maxTouchPoints > 1) return 'ios';
  return 'desktop';
}

export function AppDownloadPrompt() {
  const { t } = useTranslation('global');
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<StorePlatform>('desktop');

  useEffect(() => {
    if (wasRecentlyDismissed()) return;
    setPlatform(detectStorePlatform());
    setVisible(true);
  }, []);

  const rememberDismissal = () => {
    window.localStorage.setItem(DISMISS_KEY, new Date().toISOString());
    setVisible(false);
  };

  const openStore = (url: string) => {
    rememberDismissal();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!visible) return null;

  const showAppStore = platform === 'ios' || platform === 'desktop';
  const showPlayStore = platform === 'android' || platform === 'desktop';

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Image source={appIcon} style={styles.icon} />
          <View style={styles.headingText}>
            <Text style={styles.title}>{t('addhomeapp-heading')}</Text>
            <Text style={styles.subtitle}>CU Bus</Text>
          </View>
        </View>

        <View style={styles.storeButtons}>
          {showAppStore ? (
            <Pressable style={styles.storeButton} onPress={() => openStore(APP_STORE_URL)}>
              <Text style={styles.storeButtonEyebrow}>Download on the</Text>
              <Text style={styles.storeButtonText}>App Store</Text>
            </Pressable>
          ) : null}
          {showPlayStore ? (
            <Pressable style={styles.storeButton} onPress={() => openStore(PLAY_STORE_URL)}>
              <Text style={styles.storeButtonEyebrow}>Get it on</Text>
              <Text style={styles.storeButtonText}>Google Play</Text>
            </Pressable>
          ) : null}
        </View>

        <Pressable style={styles.cancelButton} onPress={rememberDismissal}>
          <Text style={styles.cancelText}>{t('cancel_btntxt')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 84,
    zIndex: 100,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 560,
    borderRadius: 15,
    padding: 20,
    backgroundColor: '#ffeaa7',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  icon: {
    width: 58,
    height: 58,
    borderRadius: 12,
  },
  headingText: {
    gap: 2,
  },
  title: {
    color: '#630a10',
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    color: '#7c2d32',
    fontSize: 14,
  },
  storeButtons: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  storeButton: {
    minWidth: 160,
    backgroundColor: '#111',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  storeButtonEyebrow: {
    color: '#fff',
    fontSize: 10,
    lineHeight: 12,
  },
  storeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 23,
  },
  cancelButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  cancelText: {
    color: '#630a10',
    fontWeight: '600',
  },
});
