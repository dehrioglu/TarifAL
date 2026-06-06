import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../constants/theme';
import { Recipe } from '../../types';

export type DailyPick = {
  id: string;
  label: string;
  description: string;
  recipe: Recipe;
};

type DailyPicksSectionProps = {
  picks: DailyPick[];
  onOpenPick: (pick: DailyPick) => void;
  onRefreshPicks: () => void;
};

export function DailyPicksSection({
  picks,
  onOpenPick,
  onRefreshPicks,
}: DailyPicksSectionProps) {
  return (
    <View>
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.title}>Günün seçimleri</Text>
          <Text style={styles.subtitle}>Moduna göre tek dokunuşla keşfet.</Text>
        </View>
        <TouchableOpacity
          onPress={onRefreshPicks}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Günün seçimlerini yenile"
          style={styles.refresh}
        >
          <Ionicons name="refresh-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.refreshText}>Yenile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {picks.map((pick) => (
          <TouchableOpacity
            key={pick.id}
            onPress={() => onOpenPick(pick)}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel={`${pick.label}: ${pick.recipe.title}`}
          >
            <ImageBackground source={{ uri: pick.recipe.imageUrl }} imageStyle={styles.image} style={styles.card}>
              <View style={styles.overlay} />
              <View style={styles.cardContent}>
                <Text style={styles.label}>{pick.label}</Text>
                <Text style={styles.recipeTitle} numberOfLines={2}>{pick.recipe.title}</Text>
                <Text style={styles.description} numberOfLines={2}>{pick.description}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>{pick.recipe.prepTime} dk</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.meta}>{pick.recipe.difficulty}</Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  refresh: {
    minHeight: 36,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  refreshText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  row: {
    gap: 11,
    paddingTop: 12,
    paddingRight: 4,
  },
  card: {
    width: 214,
    height: 212,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  image: {
    borderRadius: 22,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,16,32,0.52)',
  },
  cardContent: {
    padding: 14,
  },
  label: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  recipeTitle: {
    marginTop: 9,
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 21,
    fontWeight: '900',
  },
  description: {
    marginTop: 5,
    color: '#EAECF0',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  metaRow: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  meta: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  metaDot: {
    color: '#FFD7C2',
    fontSize: 10,
    fontWeight: '900',
  },
});
