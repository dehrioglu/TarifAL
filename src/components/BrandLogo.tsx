import { createElement, type CSSProperties } from 'react';
import { Image, ImageStyle, Platform, StyleProp, StyleSheet } from 'react-native';

type BrandLogoProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
  className?: string;
};

const nativeLogoSource = require('../../public/tarif.png');

export function BrandLogo({ size = 96, style, className }: BrandLogoProps) {
  if (Platform.OS === 'web') {
    const flattenedStyle = StyleSheet.flatten(style) ?? {};
    const webStyle: CSSProperties = {
      width: size,
      height: size,
      objectFit: 'contain',
      display: 'block',
      ...(flattenedStyle as CSSProperties),
    };

    return createElement('img', {
      src: '/tarif.png',
      alt: 'TarifAL',
      className,
      style: webStyle,
    });
  }

  return (
    <Image
      source={nativeLogoSource}
      accessibilityLabel="TarifAL"
      resizeMode="contain"
      style={[
        { width: size, height: size, objectFit: 'contain' },
        style,
      ]}
    />
  );
}
