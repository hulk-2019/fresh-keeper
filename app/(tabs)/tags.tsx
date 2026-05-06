import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTags } from '@/hooks/useTags';
import { useAppColors } from '@/contexts/ThemeContext';
import { Tag } from '@/types';

const PRESET_COLORS = [
  '#F44336', '#FF9800', '#FFC107', '#4CAF50',
  '#2196F3', '#9C27B0', '#795548', '#607D8B',
];

function TagRow({ tag, onEdit, onDelete, colors, t }: {
  tag: Tag; onEdit: () => void; onDelete: () => void;
  colors: ReturnType<typeof useAppColors>; t: (k: string) => string;
}) {
  return (
    <View style={[styles.tagRow, { backgroundColor: colors.cardBackground }]}>
      <View style={[styles.colorDot, { backgroundColor: tag.color }]} />
      <Text style={[styles.tagName, { color: colors.primaryText }]}>{tag.name}</Text>
      <TouchableOpacity onPress={onEdit} hitSlop={8} style={styles.actionBtn}>
        <Text style={[styles.actionText, { color: colors.primary }]}>{t('tags.editTag')}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} hitSlop={8} style={styles.actionBtn}>
        <Text style={[styles.actionText, { color: colors.expired }]}>{t('tags.deleteTag')}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TagsScreen() {
  const { t } = useTranslation();
  const colors = useAppColors();
  const { tags, loading, createTag, updateTag, deleteTag } = useTags();
  const [editing, setEditing] = useState<Tag | null>(null);
  const [inputName, setInputName] = useState('');
  const [inputColor, setInputColor] = useState(PRESET_COLORS[3]);
  const [formVisible, setFormVisible] = useState(false);

  function openCreate() {
    setEditing(null);
    setInputName('');
    setInputColor(PRESET_COLORS[3]);
    setFormVisible(true);
  }

  function openEdit(tag: Tag) {
    setEditing(tag);
    setInputName(tag.name);
    setInputColor(tag.color);
    setFormVisible(true);
  }

  async function handleSave() {
    if (!inputName.trim()) return;
    if (editing) {
      await updateTag(editing.id, inputName.trim(), inputColor);
    } else {
      await createTag(inputName.trim(), inputColor);
    }
    setFormVisible(false);
  }

  function handleDelete(tag: Tag) {
    Alert.alert(t('tags.deleteTagTitle'), t('tags.deleteTagMsg', { name: tag.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deleteTag(tag.id) },
    ]);
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.screenBackground }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.navBackground, borderBottomColor: colors.separator }]}>
        <Text style={[styles.title, { color: colors.primaryText }]}>{t('tags.title')}</Text>
        <TouchableOpacity onPress={openCreate} hitSlop={8}>
          <Text style={[styles.addBtn, { color: colors.primary }]}>{t('tags.newTag')}</Text>
        </TouchableOpacity>
      </View>

      {formVisible && (
        <View style={[styles.form, { backgroundColor: colors.cardBackground }]}>
          <TextInput
            style={[styles.formInput, { color: colors.primaryText, borderBottomColor: colors.separator }]}
            value={inputName}
            onChangeText={setInputName}
            placeholder={t('tags.tagName')}
            placeholderTextColor={colors.secondaryText}
            autoFocus
          />
          <View style={styles.colorRow}>
            {PRESET_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.colorSwatch, { backgroundColor: c }, inputColor === c && styles.colorSwatchSelected]}
                onPress={() => setInputColor(c)}
              />
            ))}
          </View>
          <View style={styles.formActions}>
            <TouchableOpacity style={[styles.formCancelBtn, { backgroundColor: colors.screenBackground }]} onPress={() => setFormVisible(false)}>
              <Text style={[styles.formCancelText, { color: colors.secondaryText }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.formSaveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={styles.formSaveText}>{editing ? t('tags.update') : t('tags.create')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!loading && tags.length === 0 && !formVisible && (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.primaryText }]}>{t('tags.noTags')}</Text>
          <Text style={[styles.emptyHint, { color: colors.secondaryText }]}>{t('tags.noTagsHint')}</Text>
        </View>
      )}

      <FlatList
        data={tags}
        keyExtractor={t => t.id}
        renderItem={({ item }) => (
          <TagRow
            tag={item}
            onEdit={() => openEdit(item)}
            onDelete={() => handleDelete(item)}
            colors={colors}
            t={t}
          />
        )}
        contentContainerStyle={styles.list}
      />
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
  addBtn: { fontSize: 16, fontWeight: '600' },
  form: { margin: 16, borderRadius: 14, padding: 16 },
  formInput: {
    fontSize: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 10,
    marginBottom: 14,
  },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  colorSwatch: { width: 28, height: 28, borderRadius: 14 },
  colorSwatchSelected: {
    borderWidth: 3, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25, shadowRadius: 3, elevation: 3,
  },
  formActions: { flexDirection: 'row', gap: 10 },
  formCancelBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  formCancelText: { fontSize: 15, fontWeight: '500' },
  formSaveBtn: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  formSaveText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  list: { paddingTop: 8, paddingBottom: 40 },
  tagRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
  },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  tagName: { flex: 1, fontSize: 16 },
  actionBtn: { marginLeft: 14 },
  actionText: { fontSize: 14, fontWeight: '500' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 17, fontWeight: '600', marginBottom: 6 },
  emptyHint: { fontSize: 14 },
});
