import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { getTextColor } from '../../../src/shared-core/utils/tools';

export function RouteBusIcon({
  busNo,
  colorCode,
  direction,
}: {
  busNo: string;
  colorCode?: string;
  direction?: string;
}) {
  const fillColor = colorCode || '#f6d365';
  const isDown = direction === 'DOWNST';

  return (
    <View style={styles.wrapper}>
      <Svg width={60} height={44} viewBox="0 0 24 24">
        <Path
          d="M17 20H7V21C7 21.5523 6.55228 22 6 22H5C4.44772 22 4 21.5523 4 21V20H3V12H2V8H3V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V8H22V12H21V20H20V21C20 21.5523 19.5523 22 19 22H18C17.4477 22 17 21.5523 17 21V20ZM5 5V14H19V5H5ZM5 16V18H9V16H5ZM15 16V18H19V16H15Z"
          fill="#630a10"
        />
        <G>
          <Rect x="5" y="5" width="14" height="9" fill={fillColor} />
          <SvgText
            x="12"
            y="10"
            fontSize="7"
            fill={getTextColor(fillColor)}
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {busNo}
          </SvgText>
        </G>
      </Svg>
      {direction ? (
        <View style={styles.directionIcon}>
          <Ionicons
            name={isDown ? 'caret-down-circle-outline' : 'caret-up-circle-outline'}
            size={15}
            color={isDown ? 'rgb(234, 72, 64)' : 'green'}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 60,
    height: 44,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionIcon: {
    position: 'absolute',
    right: 7,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 999,
  },
});
