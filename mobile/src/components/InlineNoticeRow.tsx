import React from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

const alertIcon = require('../assets/alert.png');
const infoIcon = require('../assets/info.png');
const criticalIcon = require('../assets/critical.png');

export function InlineNoticeRow({
  text,
  variant = 'alert',
  children,
  style,
}: {
  text?: string;
  variant?: 'alert' | 'info' | 'critical';
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const iconSource =
    variant === 'info' ? infoIcon : variant === 'critical' ? criticalIcon : alertIcon;

  return (
    <View style={[styles.row, style]}>
      <Image source={iconSource} style={styles.icon} resizeMode="contain" />
      <View style={styles.content}>{children ?? <Text style={styles.text}>{text}</Text>}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#ddd',
    borderRadius: 5,
    borderWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    width: 18,
    height: 18,
    marginTop: 1,
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  text: {
    color: '#333',
    lineHeight: 20,
  },
});
