import React from 'react';
import { Image, ImageStyle, StyleSheet, View, ViewStyle } from 'react-native';

const loadingImage = require('../../assets/download.gif');

export function ProjectLoadingIndicator({
  size = 105,
  containerStyle,
  imageStyle,
}: {
  size?: number;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        source={loadingImage}
        style={[styles.image, { width: size, height: size }, imageStyle]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 105,
    height: 105,
  },
});
