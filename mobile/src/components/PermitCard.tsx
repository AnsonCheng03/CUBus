import React from 'react';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { cuhkLogo, meetClassBusImage, permitBusRoutes, shuttleBusImage } from '../lib/permit';
import type { PermitFormValue } from '../types/mobile';

const CARD_WIDTH = 560;
const CARD_HEIGHT = 356;
const CARD_RATIO = CARD_WIDTH / CARD_HEIGHT;
const FONT_CARD_SERIF = 'Times New Roman';
const FONT_CARD_SANS = 'Arial';
const FONT_CARD_SANS_ALT = 'Helvetica';

type BusMode = keyof typeof permitBusRoutes;

export type PermitCardProps = {
  permit: PermitFormValue;
  busMode: BusMode;
  targetWidth: number;
  onPress?: () => void;
  testID?: string;
  withShadow?: boolean;
};

function RouteChip({
  route,
  colors,
  scale,
}: {
  route: string;
  colors: readonly [string, string];
  scale: number;
}) {
  const chipWidth = 31 * scale;
  const chipHeight = 20 * scale;
  const fontSize = 15 * scale;

  return (
    <View style={{ width: chipWidth, height: chipHeight }}>
      <Svg width={chipWidth} height={chipHeight} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient
            id={`permit-gradient-${route}-${colors[0]}-${colors[1]}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <Stop offset="0%" stopColor={colors[0]} />
            <Stop offset="100%" stopColor={colors[1]} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={chipWidth}
          height={chipHeight}
          fill={`url(#permit-gradient-${route}-${colors[0]}-${colors[1]})`}
        />
      </Svg>
      <View style={styles.routeChipLabel}>
        <Text style={[styles.routeChipText, { fontSize }]}>{route}</Text>
      </View>
    </View>
  );
}

export function PermitCard({
  permit,
  busMode,
  targetWidth,
  onPress,
  testID,
  withShadow = true,
}: PermitCardProps) {
  const scale = targetWidth / CARD_WIDTH;
  const targetHeight = targetWidth / CARD_RATIO;
  const title = busMode === 'meet_class_bus' ? '轉堂校巴證' : '穿梭校巴證';
  const subtitle = busMode === 'meet_class_bus' ? 'Meet-Class Bus Permit' : 'Shuttle Bus Permit';
  const busImage = busMode === 'meet_class_bus' ? meetClassBusImage : shuttleBusImage;
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      testID={testID}
      style={[
        styles.previewShell,
        withShadow && styles.previewShadow,
        {
          width: targetWidth,
          height: targetHeight,
          borderRadius: 10 * scale,
        },
      ]}
    >
      <ImageBackground
        source={busImage}
        resizeMode="stretch"
        style={{
          width: targetWidth,
          height: targetHeight,
        }}
        imageStyle={{ borderRadius: 10 * scale }}
      >
        <View
          style={[
            styles.cardCanvas,
            {
              paddingTop: 23 * scale,
              paddingBottom: 23 * scale,
              paddingHorizontal: 40 * scale,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={{ width: 50 * scale, marginLeft: 0 }}>
              {/* <Image
                source={cuhkLogo}
                resizeMode="contain"
                style={{ width: 53 * scale, height: 53 * 0.8 * scale }}
              /> */}
            </View>
            <View
              style={{ width: 220 * scale, marginHorizontal: 10 * scale, marginTop: 2 * scale }}
            >
              <Text
                style={[
                  styles.schoolZh,
                  { fontSize: 15 * scale, letterSpacing: 5 * scale, marginBottom: 1 * scale },
                ]}
                numberOfLines={1}
              >
                香港中文大學
              </Text>
              <Text style={[styles.schoolEn, { fontSize: 12.5 * scale }]} numberOfLines={1}>
                The Chinese University of Hong Kong
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                marginTop: 6 * scale,
                marginLeft: 22 * scale,
                marginRight: 0,
              }}
            >
              <Text
                style={[styles.hintZh, { fontSize: 16 * scale, letterSpacing: 1 * scale }]}
                numberOfLines={1}
              >
                落車前請按鐘一次
              </Text>
              <Text style={[styles.hintEn, { fontSize: 10 * scale }]} numberOfLines={1}>
                To Stop Press The Bell Once
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 12 * scale }}>
            <Text
              style={[
                styles.cardTitle,
                {
                  fontSize: 45 * scale,
                  letterSpacing: 3 * scale,
                  marginLeft: -2 * scale,
                  marginBottom: 2 * scale,
                },
              ]}
            >
              {title}
            </Text>
            <Text
              style={[
                styles.cardSubtitle,
                { fontSize: 20.5 * scale, marginTop: -5 * scale, paddingBottom: 10 * scale },
              ]}
            >
              {subtitle}
            </Text>
          </View>

          <View style={{ marginTop: 2 * scale }}>
            <Text style={[styles.routeDesc, { fontSize: 10 * scale }]}>
              持證者獲交通事務處批准乘搭下列的穿梭校巴路線
            </Text>
            <Text style={[styles.routeDesc, { fontSize: 10 * scale }]}>
              The Permit Holder is allowed to ride on the following routes
            </Text>
            <View
              style={{
                flexDirection: 'row',
                gap: 3 * scale,
                marginTop: 10 * scale,
                marginBottom: 10 * scale,
              }}
            >
              {Object.entries(permitBusRoutes[busMode]).map(([route, colors]) => (
                <RouteChip key={route} route={route} colors={colors} scale={scale} />
              ))}
            </View>
          </View>

          <View style={{ paddingTop: 10 * scale, gap: 0 * scale }}>
            {[
              ['學生姓名 Name', permit.name],
              ['學生編號 Student ID', permit.sid],
              ['主修科目 Major', permit.major],
              ['有效期至 Valid Until', permit.expiry],
            ].map(([label, value]) => (
              <View key={label} style={styles.dataRow}>
                <Text
                  style={[
                    styles.dataLabel,
                    {
                      width: 120 * scale,
                      fontSize: 12 * scale,
                      lineHeight: 16 * scale,
                    },
                  ]}
                >
                  {label}
                </Text>
                <Text
                  style={[
                    styles.dataValue,
                    {
                      fontSize: 13 * scale,
                      lineHeight: 12 * scale,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ImageBackground>
    </Wrapper>
  );
}

export const PERMIT_CARD_RATIO = CARD_RATIO;

const styles = StyleSheet.create({
  previewShell: {
    overflow: 'hidden',
    backgroundColor: '#000',
    alignSelf: 'center',
  },
  previewShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  cardCanvas: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  schoolZh: {
    color: '#fff',
    fontFamily: FONT_CARD_SANS,
  },
  schoolEn: {
    color: '#fff',
    fontFamily: FONT_CARD_SERIF,
  },
  hintZh: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: FONT_CARD_SANS,
    fontWeight: '400',
  },
  hintEn: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: FONT_CARD_SANS_ALT,
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: '#fff',
    fontFamily: FONT_CARD_SANS,
    textAlign: 'left',
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#fff',
    fontFamily: FONT_CARD_SANS_ALT,
    textTransform: 'uppercase',
    textAlign: 'left',
  },
  routeDesc: {
    color: 'rgb(236, 240, 241)',
    fontFamily: FONT_CARD_SANS,
  },
  routeChipLabel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeChipText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: FONT_CARD_SANS_ALT,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dataLabel: {
    color: '#fff',
    fontFamily: FONT_CARD_SANS,
  },
  dataValue: {
    flex: 1,
    color: '#fff',
    fontFamily: FONT_CARD_SANS,
  },
});
