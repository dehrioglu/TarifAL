import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { theme } from '../constants/theme';

type BrandLogoProps = {
  variant?: 'full' | 'mark';
  size?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export function BrandLogo({ variant = 'full', size = 96, style, imageStyle }: BrandLogoProps) {
  const source =
    variant === 'full'
      ? require('../../assets/tarifal-logo.png')
      : require('../../assets/tarifal-mark.png');

  return (
    <View
      style={[
        styles.wrap,
        variant === 'mark' && styles.markWrap,
        { width: size, height: size },
        style,
      ]}
    >
      <Image source={source} resizeMode="contain" style={[styles.image, imageStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markWrap: {
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
