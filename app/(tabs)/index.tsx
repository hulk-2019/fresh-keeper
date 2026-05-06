import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useItems } from '@/hooks/useItems';
import { useCategories } from '@/hooks/useCategories';
import { FilterTabBar } from '@/components/items/FilterTabBar';
import { ItemCard } from '@/components/items/ItemCard';
import { AddEntrySheet } from '@/components/items/AddEntrySheet';
import { useAppColors } from '@/contexts/ThemeContext';
import { Item } from '@/types';

export default function ItemsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useAppColors();
  const [filter, setFilter] = useState<'all' | 'expiring'>('all');
  const [sheetVisible, setSheetVisible] = useState(false);
  const { items, loading, allCount, expiringCount } = useItems();
  const { categories } = useCategories();

  const categoryMap = Object.fromEntries(categories.map(c => [c.id, c]));

  const displayed: Item[] = filter === 'expiring'
    ? items.filter(i => i.status === 'expiring')
    : items;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.screenBackground }]}>
      <FilterTabBar
        active={filter}
        allCount={allCount}
        expiringCount={expiringCount}
        onChange={setFilter}
      />

      {!loading && displayed.length === 0 && (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.primaryText }]}>
            {filter === 'expiring' ? t('items.noExpiringItems') : t('items.noItems')}
          </Text>
          <Text style={[styles.emptyHint, { color: colors.secondaryText }]}>{t('items.addFirstItem')}</Text>
        </View>
      )}

      <FlatList
        data={displayed}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            categoryColor={categoryMap[item.categoryId]?.color}
            onPress={() => router.push(`/item/${item.id}` as any)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
        onPress={() => setSheetVisible(true)}
        activeOpacity={0.85}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <AddEntrySheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onManualEntry={() => {
          setSheetVisible(false);
          router.push('/modal' as any);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingTop: 4, paddingBottom: 100 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyText: { fontSize: 17, fontWeight: '600', marginBottom: 6 },
  emptyHint: { fontSize: 14 },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 32,
    fontWeight: '300',
  },
});
