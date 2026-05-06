import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppColors } from '@/contexts/ThemeContext';

interface Props {
  active: 'all' | 'expiring';
  allCount: number;
  expiringCount: number;
  onChange: (tab: 'all' | 'expiring') => void;
}

export function FilterTabBar({ active, allCount, expiringCount, onChange }: Props) {
  const { t } = useTranslation();
  const colors = useAppColors();

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.cardBackground }, active === 'all' && { backgroundColor: colors.primary }]}
        onPress={() => onChange('all')}
        activeOpacity={0.8}>
        <Text style={[styles.count, { color: colors.primaryText }, active === 'all' && styles.countActive]}>{allCount}</Text>
        <Text style={[styles.label, { color: colors.secondaryText }, active === 'all' && styles.labelActive]}>{t('items.all')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.cardBackground }, active === 'expiring' && { backgroundColor: colors.expiring }]}
        onPress={() => onChange('expiring')}
        activeOpacity={0.8}>
        <Text style={[styles.count, { color: colors.primaryText }, active === 'expiring' && styles.countActive]}>{expiringCount}</Text>
        <Text style={[styles.label, { color: colors.secondaryText }, active === 'expiring' && styles.labelActive]}>{t('items.expiring')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  card: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  count: {
    fontSize: 22,
    fontWeight: '700',
  },
  countActive: {
    color: '#fff',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  labelActive: {
    color: 'rgba(255,255,255,0.85)',
  },
});
