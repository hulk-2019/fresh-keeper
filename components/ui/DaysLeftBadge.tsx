import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ItemStatus } from '@/types';
import { useAppColors } from '@/contexts/ThemeContext';

interface Props {
  daysLeft: number;
  status: ItemStatus;
  size?: 'small' | 'large';
}

export function DaysLeftBadge({ daysLeft, status, size = 'small' }: Props) {
  const { t } = useTranslation();
  const colors = useAppColors();

  const bg =
    status === 'expired' ? colors.expired :
    status === 'expiring' ? colors.expiring :
    colors.fresh;

  const isLarge = size === 'large';

  return (
    <View style={[styles.badge, { backgroundColor: bg + '22' }, isLarge && styles.badgeLarge]}>
      <Text style={[styles.number, { color: bg }, isLarge && styles.numberLarge]}>
        {daysLeft <= 0 ? '0' : String(daysLeft)}
      </Text>
      <Text style={[styles.label, { color: bg }, isLarge && styles.labelLarge]}>
        {daysLeft <= 0 ? t('items.expired') : 'Days'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLarge: {
    width: 72,
    height: 72,
    borderRadius: 14,
  },
  number: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  numberLarge: {
    fontSize: 26,
    lineHeight: 30,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
  labelLarge: {
    fontSize: 13,
  },
});
