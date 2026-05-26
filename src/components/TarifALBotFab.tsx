import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type TarifALBotFabProps = {
  onPress: () => void;
};

export function TarifALBotFab({ onPress }: TarifALBotFabProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel="TarifAL Bot"
      style={styles.fab}
    >
      <View style={styles.spark}>
        <Ionicons name="sparkles" size={16} color="#FFFFFF" />
      </View>
      <Text style={styles.text}>Bot</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 96,
    minWidth: 72,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    ...theme.orangeShadow,
  },
  spark: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
