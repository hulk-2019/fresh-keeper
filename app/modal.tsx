import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useItems } from '@/hooks/useItems';
import { useCategories } from '@/hooks/useCategories';
import { useAppColors } from '@/contexts/ThemeContext';

export default function ModalScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useAppColors();
  const { createItem } = useItems();
  const { categories } = useCategories();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('cat_other');
  const [expiryDate, setExpiryDate] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  function isValidDate(s: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    return !isNaN(new Date(s).getTime());
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert(t('form.nameRequired'), t('form.nameRequiredMsg'));
      return;
    }
    if (!isValidDate(expiryDate)) {
      Alert.alert(t('form.invalidDate'), t('form.invalidDateMsg'));
      return;
    }
    if (productionDate && !isValidDate(productionDate)) {
      Alert.alert(t('form.invalidDate'), t('form.invalidDateMsg'));
      return;
    }
    setSaving(true);
    try {
      await createItem({
        name: name.trim(), categoryId, tagIds: [],
        expiryDate,
        productionDate: productionDate || undefined,
        notes: notes.trim() || undefined,
        archived: false,
      });
      router.dismiss();
    } catch {
      Alert.alert(t('form.saveError'), t('form.saveErrorMsg'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.screenBackground }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { backgroundColor: colors.navBackground, borderBottomColor: colors.separator }]}>
          <TouchableOpacity onPress={() => router.dismiss()} hitSlop={12}>
            <Text style={[styles.cancel, { color: colors.secondaryText }]}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.primaryText }]}>{t('form.newItem')}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving} hitSlop={12}>
            <Text style={[styles.save, { color: colors.primary }, saving && styles.saveDisabled]}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>{t('form.name')} *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
              value={name}
              onChangeText={setName}
              placeholder={t('form.namePlaceholder')}
              placeholderTextColor={colors.secondaryText}
              returnKeyType="next"
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>{t('form.category')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catChip,
                    { borderColor: cat.color, backgroundColor: colors.inputBackground },
                    categoryId === cat.id && { backgroundColor: cat.color },
                  ]}
                  onPress={() => setCategoryId(cat.id)}
                  activeOpacity={0.7}>
                  <Text style={[styles.catText, { color: colors.primaryText }, categoryId === cat.id && styles.catTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>{t('form.expiryDate')} *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
              value={expiryDate}
              onChangeText={setExpiryDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.secondaryText}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>{t('form.productionDate')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
              value={productionDate}
              onChangeText={setProductionDate}
              placeholder={t('form.productionDatePlaceholder')}
              placeholderTextColor={colors.secondaryText}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.secondaryText }]}>{t('form.notes')}</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('form.notesPlaceholder')}
              placeholderTextColor={colors.secondaryText}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 17, fontWeight: '600' },
  cancel: { fontSize: 17 },
  save: { fontSize: 17, fontWeight: '600' },
  saveDisabled: { opacity: 0.4 },
  scroll: { flex: 1, paddingTop: 16 },
  section: { marginBottom: 16, paddingHorizontal: 16 },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 13,
  },
  catScroll: { marginHorizontal: -4 },
  catChip: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginHorizontal: 4,
  },
  catText: { fontSize: 14, fontWeight: '500' },
  catTextActive: { color: '#fff' },
});
