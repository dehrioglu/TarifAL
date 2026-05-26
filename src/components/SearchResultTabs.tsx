import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { theme } from '../constants/theme';

export type SearchTab = 'recipes' | 'chefs' | 'tags' | 'collections';

type SearchResultTabsProps = {
  active: SearchTab;
  onChange: (tab: SearchTab) => void;
};

const tabs: Array<{ id: SearchTab; label: string }> = [
  { id: 'recipes', label: 'Tarifler' },
  { id: 'chefs', label: 'Şefler' },
  { id: 'tags', label: 'Etiketler' },
  { id: 'collections', label: 'Koleksiyonlar' },
];

export function SearchResultTabs({ active, onChange }: SearchResultTabsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => onChange(tab.id)}
          activeOpacity={0.86}
          style={[styles.tab, active === tab.id && styles.activeTab]}
        >
          <Text style={[styles.text, active === tab.id && styles.activeText]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 10,
  },
  tab: {
    minHeight: 40,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  activeTab: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  text: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  activeText: {
    color: '#FFFFFF',
  },
});
