import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NAV_RESPONSIVE_BREAKPOINT } from '../lib/layout';

const NAV_ITEMS = [
  { href: '/', labelKey: 'NAV-Home', icon: 'home-outline' as const, match: ['/', '/index'] },
  { href: '/route', labelKey: 'NAV-StationSearch', icon: 'search-outline' as const, match: ['/route'] },
  { href: '/permit', labelKey: 'NAV-Permit', icon: 'id-card-outline' as const, match: ['/permit'] },
  { href: '/settings', labelKey: 'NAV-Settings', icon: 'settings-outline' as const, match: ['/settings'] },
] as const;

function isActivePath(pathname: string, matches: readonly string[]) {
  return matches.some((match) => pathname === match || pathname.startsWith(`${match}/`));
}

export function CustomNavBar() {
  const { t } = useTranslation('global');
  const pathname = usePathname();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLargeScreen = width >= NAV_RESPONSIVE_BREAKPOINT;

  const renderItem = (item: (typeof NAV_ITEMS)[number]) => {
    const active = isActivePath(pathname, item.match);

    return (
      <Pressable key={item.href} style={styles.navItem} onPress={() => router.replace(item.href)}>
        <View style={styles.navLink}>
          <Ionicons
            name={item.icon}
            size={isLargeScreen ? 21 : 22}
            color={active ? (isLargeScreen ? '#fff' : 'rgb(145, 31, 39)') : isLargeScreen ? '#ccc' : '#aaa'}
          />
          <Text
            style={[
              styles.navText,
              isLargeScreen ? styles.topNavText : styles.bottomNavText,
              active
                ? isLargeScreen
                  ? styles.topNavTextActive
                  : styles.bottomNavTextActive
                : isLargeScreen
                  ? styles.topNavTextInactive
                  : styles.bottomNavTextInactive,
            ]}
          >
            {t(item.labelKey)}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (isLargeScreen) {
    return (
      <View style={[styles.topBar, { height: 75 + insets.top, paddingTop: insets.top }]}>
        <Text style={styles.title}>{t('WEB-Title')}</Text>
        <View style={styles.topNavActions}>
          <View style={styles.topNavList}>{NAV_ITEMS.map(renderItem)}</View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.bottomBar, { height: 75 + insets.bottom, paddingBottom: insets.bottom }]}>
      <View style={styles.bottomNavList}>{NAV_ITEMS.map(renderItem)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: '#911f27',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: -1,
    paddingVertical: 10,
    paddingHorizontal: 30,
    textAlign: 'left',
  },
  topNavActions: {
    flex: 1,
    maxHeight: 75,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  topNavList: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 28,
    marginHorizontal: '5%',
  },
  bottomBar: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: 'rgba(154, 160, 185, 0.5)',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 16,
    justifyContent: 'center',
  },
  bottomNavList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 12,
  },
  navItem: {
    minWidth: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLink: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
  },
  navText: {
    margin: 0,
    fontSize: 12,
    textAlign: 'center',
  },
  topNavText: {
    fontSize: 13,
  },
  bottomNavText: {
    fontSize: 12,
  },
  topNavTextActive: {
    color: '#fff',
  },
  topNavTextInactive: {
    color: '#ccc',
  },
  bottomNavTextActive: {
    color: 'rgb(145, 31, 39)',
  },
  bottomNavTextInactive: {
    color: '#aaa',
  },
});
