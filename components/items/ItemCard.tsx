import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Item, Tag } from '@/types';
import { DaysLeftBadge } from '@/components/ui/DaysLeftBadge';
import { useAppColors } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';

interface Props {
  item: Item;
  tags?: Tag[];
  onPress: () => void;
}

function formatDate(dateStr: string, language: string): string {
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  const d = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
}

export function ItemCard({ item, tags, onPress }: Props) {
  const colors = useAppColors();
  const { language } = useI18n();
  const placeholderBg = tags?.[0]?.color ?? colors.primary;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={[styles.thumbnail, { backgroundColor: placeholderBg + '22' }]}>
        {item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.placeholderDot, { backgroundColor: placeholderBg }]} />
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.primaryText }]} numberOfLines={1}>{item.name}</Text>
        <View style={styles.metaRow}>
          {tags?.map(tag => (
            <View key={tag.id} style={[styles.tagChip, { backgroundColor: tag.color + '22', borderColor: tag.color }]}>
              <Text style={[styles.tagText, { color: tag.color }]} numberOfLines={1}>{tag.name}</Text>
            </View>
          ))}
          <Text style={[styles.date, { color: colors.secondaryText }]}>{formatDate(item.expiryDate, language === 'system' ? 'en' : language)}</Text>
        </View>
      </View>

      <DaysLeftBadge daysLeft={item.daysLeft} status={item.status} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 56,
    height: 56,
  },
  placeholderDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.6,
  },
  info: {
    flex: 1,
    marginHorizontal: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  tagChip: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  date: {
    fontSize: 13,
  },
});
