import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';

type TarifALBotFabProps = {
  onPress: () => void;
};

export function TarifALBotFab({ onPress }: TarifALBotFabProps) {
  return (
    <View style={styles.fabWrap}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityLabel="AI Şef’e sor"
        style={styles.fab}
      >
        <Ionicons name="sparkles" size={21} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.caption}>AI Şef</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fabWrap: {
    position: 'absolute',
    right: 18,
    bottom: 104,
    alignItems: 'center',
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...theme.orangeShadow,
    shadowOpacity: 0.18,
  },
  caption: {
    marginTop: 3,
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
});
