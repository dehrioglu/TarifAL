import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const theme = {
  colors: {
    background: '#FFFFFF',
    surface: '#F8F9FB',
    primary: '#FF5A00',
    primarySoft: '#FFF0E8',
    text: '#0B1020',
    muted: '#667085',
    subtle: '#98A2B3',
    border: '#E6E8EF',
    danger: '#EF4444',
    success: '#12B76A',
    cardShadow: 'rgba(15, 23, 42, 0.12)',
  },
  radius: {
    sm: 12,
    md: 18,
    lg: 24,
    pill: 999,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
  },
  screen: {
    padding: Math.max(20, Math.min(28, width * 0.06)),
  },
  shadow: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  orangeShadow: {
    shadowColor: '#FF5A00',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 7,
  },
};
