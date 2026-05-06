import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/hooks/useSettings';
import { useAppColors } from '@/contexts/ThemeContext';
import { useTheme, ThemePreference } from '@/contexts/ThemeContext';
import { useI18n, Language } from '@/contexts/I18nContext';

function SettingsRow({
  label, value, onPress, colors,
}: {
  label: string; value?: string; onPress?: () => void;
  colors: ReturnType<typeof useAppColors>;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.6}>
      <Text style={[styles.rowLabel, { color: colors.primaryText }]}>{label}</Text>
      {value !== undefined && <Text style={[styles.rowValue, { color: colors.secondaryText }]}>{value}</Text>}
      {onPress && <Text style={[styles.chevron, { color: colors.separator }]}>›</Text>}
    </TouchableOpacity>
  );
}

function SegmentControl<T extends string>({
  options, value, onChange, colors,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  colors: ReturnType<typeof useAppColors>;
}) {
  return (
    <View style={[styles.segment, { backgroundColor: colors.inputBackground }]}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.key}
          style={[styles.segmentItem, value === opt.key && { backgroundColor: colors.primary }]}
          onPress={() => onChange(opt.key)}
          activeOpacity={0.7}>
          <Text style={[styles.segmentText, { color: value === opt.key ? '#fff' : colors.secondaryText }]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const colors = useAppColors();
  const { settings, setSetting } = useSettings();
  const { preference: themePref, setPreference: setThemePref } = useTheme();
  const { language, setLanguage } = useI18n();

  const [editingKey, setEditingKey] = useState<'defaultPrimaryReminderDays' | 'defaultSecondaryReminderDays' | null>(null);
  const [editingValue, setEditingValue] = useState('');

  function startEdit(key: 'defaultPrimaryReminderDays' | 'defaultSecondaryReminderDays') {
    setEditingKey(key);
    setEditingValue(String(settings[key]));
  }

  async function commitEdit() {
    if (!editingKey) return;
    const n = parseInt(editingValue, 10);
    if (!isNaN(n) && n > 0) await setSetting(editingKey, n);
    setEditingKey(null);
  }

  const version = Constants.expoConfig?.version ?? '—';

  const themeOptions: { key: ThemePreference; label: string }[] = [
    { key: 'system', label: t('settings.themeSystem') },
    { key: 'light', label: t('settings.themeLight') },
    { key: 'dark', label: t('settings.themeDark') },
  ];

  const langOptions: { key: Language; label: string }[] = [
    { key: 'system', label: t('settings.languageSystem') },
    { key: 'en', label: t('settings.languageEn') },
    { key: 'zh', label: t('settings.languageZh') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.screenBackground }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.navBackground, borderBottomColor: colors.separator }]}>
        <Text style={[styles.title, { color: colors.primaryText }]}>{t('settings.title')}</Text>
      </View>

      <ScrollView>
        <Text style={[styles.sectionHeader, { color: colors.secondaryText }]}>{t('settings.preferences')}</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.primaryText }]}>{t('settings.language')}</Text>
          </View>
          <View style={styles.segmentWrapper}>
            <SegmentControl options={langOptions} value={language} onChange={setLanguage} colors={colors} />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.separator }]} />
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.primaryText }]}>{t('settings.theme')}</Text>
          </View>
          <View style={styles.segmentWrapper}>
            <SegmentControl options={themeOptions} value={themePref} onChange={setThemePref} colors={colors} />
          </View>
        </View>

        <Text style={[styles.sectionHeader, { color: colors.secondaryText }]}>{t('settings.defaults')}</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          {editingKey === 'defaultPrimaryReminderDays' ? (
            <View style={styles.editRow}>
              <Text style={[styles.rowLabel, { color: colors.primaryText }]}>{t('settings.primaryReminder')}</Text>
              <TextInput
                style={[styles.editInput, { color: colors.primaryText, borderColor: colors.primary }]}
                value={editingValue}
                onChangeText={setEditingValue}
                keyboardType="number-pad"
                autoFocus
                onBlur={commitEdit}
                onSubmitEditing={commitEdit}
              />
            </View>
          ) : (
            <SettingsRow
              label={t('settings.primaryReminder')}
              value={t('settings.reminderUnit', { count: settings.defaultPrimaryReminderDays })}
              onPress={() => startEdit('defaultPrimaryReminderDays')}
              colors={colors}
            />
          )}
          <View style={[styles.divider, { backgroundColor: colors.separator }]} />
          {editingKey === 'defaultSecondaryReminderDays' ? (
            <View style={styles.editRow}>
              <Text style={[styles.rowLabel, { color: colors.primaryText }]}>{t('settings.secondaryReminder')}</Text>
              <TextInput
                style={[styles.editInput, { color: colors.primaryText, borderColor: colors.primary }]}
                value={editingValue}
                onChangeText={setEditingValue}
                keyboardType="number-pad"
                autoFocus
                onBlur={commitEdit}
                onSubmitEditing={commitEdit}
              />
            </View>
          ) : (
            <SettingsRow
              label={t('settings.secondaryReminder')}
              value={t('settings.reminderUnit', { count: settings.defaultSecondaryReminderDays })}
              onPress={() => startEdit('defaultSecondaryReminderDays')}
              colors={colors}
            />
          )}
        </View>
        <Text style={[styles.sectionFooter, { color: colors.secondaryText }]}>{t('settings.reminderNote')}</Text>

        <Text style={[styles.sectionHeader, { color: colors.secondaryText }]}>{t('settings.about')}</Text>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <SettingsRow label={t('settings.version')} value={version} colors={colors} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 17, fontWeight: '600' },
  sectionHeader: {
    fontSize: 13, fontWeight: '500',
    textTransform: 'uppercase', letterSpacing: 0.4,
    marginTop: 24, marginBottom: 6, marginHorizontal: 20,
  },
  sectionFooter: {
    fontSize: 12, marginHorizontal: 20, marginTop: 6, lineHeight: 17,
  },
  card: { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  rowLabel: { flex: 1, fontSize: 16 },
  rowValue: { fontSize: 16, marginRight: 4 },
  chevron: { fontSize: 20 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  segmentWrapper: { paddingHorizontal: 16, paddingBottom: 14 },
  segment: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  segmentItem: {
    flex: 1, paddingVertical: 7,
    borderRadius: 8, alignItems: 'center',
  },
  segmentText: { fontSize: 14, fontWeight: '500' },
  editRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  editInput: {
    borderWidth: 1.5, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
    fontSize: 16, minWidth: 60, textAlign: 'center',
  },
});
