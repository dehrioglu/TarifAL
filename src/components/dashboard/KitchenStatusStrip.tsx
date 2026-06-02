import { ComponentProps } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type KitchenStatusItem = {
  id: string;
  icon: IconName;
  value: string;
  label: string;
  tone?: 'orange' | 'green' | 'navy';
};

type KitchenStatusStripProps = {
  items: KitchenStatusItem[];
};

export function KitchenStatusStrip({ items }: KitchenStatusStripProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <View
            style={[
              styles.icon,
              item.tone === 'green' && styles.greenIcon,
              item.tone === 'navy' && styles.navyIcon,
            ]}
          >
            <Ionicons
              name={item.icon}
              size={17}
              color={
                item.tone === 'green'
                  ? theme.colors.success
                  : item.tone === 'navy'
                    ? theme.colors.text
                    : theme.colors.primary
              }
            />
          </View>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 9,
    paddingVertical: 2,
    paddingRight: 4,
  },
  card: {
    width: 132,
    minHeight: 106,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    padding: 11,
  },
  icon: {
    width: 31,
    height: 31,
    borderRadius: 12,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenIcon: {
    backgroundColor: '#ECFDF3',
  },
  navyIcon: {
    backgroundColor: '#EEF1F7',
  },
  value: {
    marginTop: 9,
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  label: {
    marginTop: 3,
    color: theme.colors.muted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
  },
});
