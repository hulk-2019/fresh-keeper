import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useItems } from '@/hooks/useItems';
import { useTags } from '@/hooks/useTags';
import { useAppColors } from '@/contexts/ThemeContext';
import { pickFromCamera, pickFromLibrary, savePhoto } from '@/services/PhotoEntryService';
import { DatePickerField } from '@/components/ui/DatePickerField';

export default function ModalScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useAppColors();
  const { createItem } = useItems();
  const { tags, createTag } = useTags();
  const { photoUri: initialPhotoUri } = useLocalSearchParams<{ photoUri?: string }>();

  const [photoUri, setPhotoUri] = useState<string | undefined>(initialPhotoUri);
  const [name, setName] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [quickTagName, setQuickTagName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const TAG_COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4', '#FF5722'];

  async function handleQuickCreateTag() {
    const trimmed = quickTagName.trim();
    if (!trimmed) return;
    const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
    await createTag(trimmed, color);
    setQuickTagName('');
  }

  function handleChangePhoto() {
    Alert.alert(t('items.imageEntry'), '', [
      {
        text: t('items.takePhoto'),
        onPress: async () => {
          const uri = await pickFromCamera();
          if (uri) setPhotoUri(uri);
        },
      },
      {
        text: t('items.chooseFromLibrary'),
        onPress: async () => {
          const uri = await pickFromLibrary();
          if (uri) setPhotoUri(uri);
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert(t('form.nameRequired'), t('form.nameRequiredMsg'));
      return;
    }
    if (!expiryDate) {
      Alert.alert(t('form.invalidDate'), t('form.invalidDateMsg'));
      return;
    }
    setSaving(true);
    try {
      const persistedPhotoUri = photoUri ? await savePhoto(photoUri) : undefined;
      await createItem({
        name: name.trim(), tagIds: selectedTagIds,
        expiryDate,
        productionDate: productionDate || undefined,
        notes: notes.trim() || undefined,
        photoUri: persistedPhotoUri,
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
            <Text style={[styles.label, { color: colors.secondaryText }]}>{t('form.photo')}</Text>
            <TouchableOpacity
              style={[styles.photoBox, { backgroundColor: colors.inputBackground }]}
              onPress={handleChangePhoto}
              activeOpacity={0.7}>
              {photoUri ? (
                <>
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} contentFit="cover" />
                  <View style={styles.changeOverlay}>
                    <Text style={styles.changeText}>{t('form.changePhoto')}</Text>
                  </View>
                </>
              ) : (
                <Text style={[styles.photoPlaceholder, { color: colors.secondaryText }]}>{t('form.addPhoto')}</Text>
              )}
            </TouchableOpacity>
          </View>

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
            {tags.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {tags.map(tag => (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.catChip,
                      { borderColor: tag.color, backgroundColor: colors.inputBackground },
                      selectedTagIds.includes(tag.id) && { backgroundColor: tag.color },
                    ]}
                    onPress={() => setSelectedTagIds(prev =>
                      prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                    )}
                    activeOpacity={0.7}>
                    <Text style={[styles.catText, { color: colors.primaryText }, selectedTagIds.includes(tag.id) && styles.catTextActive]}>
                      {tag.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.quickCreateRow}>
                <TextInput
                  style={[styles.quickCreateInput, { backgroundColor: colors.inputBackground, color: colors.primaryText }]}
                  value={quickTagName}
                  onChangeText={setQuickTagName}
                  placeholder={t('form.quickCreateTag')}
                  placeholderTextColor={colors.secondaryText}
                  returnKeyType="done"
                  onSubmitEditing={handleQuickCreateTag}
                />
                <TouchableOpacity
                  style={[styles.quickCreateBtn, { backgroundColor: colors.primary }]}
                  onPress={handleQuickCreateTag}
                  activeOpacity={0.7}>
                  <Text style={styles.quickCreateBtnText}>{t('form.quickCreateTagBtn')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <DatePickerField
              label={t('form.expiryDate')}
              value={expiryDate}
              onChange={setExpiryDate}
              required
            />
          </View>

          <View style={styles.section}>
            <DatePickerField
              label={t('form.productionDate')}
              value={productionDate}
              onChange={setProductionDate}
              placeholder={t('form.productionDatePlaceholder')}
              maximumDate={new Date()}
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
  quickCreateRow: { flexDirection: 'row', gap: 8 },
  quickCreateInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
  },
  quickCreateBtn: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    justifyContent: 'center',
  },
  quickCreateBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  photoBox: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  changeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 6,
    alignItems: 'center',
  },
  changeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  photoPlaceholder: {
    fontSize: 15,
  },
});
