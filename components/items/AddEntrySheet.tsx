import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useAppColors } from '@/contexts/ThemeContext';
import { pickFromCamera, pickFromLibrary } from '@/services/PhotoEntryService';

interface Props {
  visible: boolean;
  onClose: () => void;
  onManualEntry: () => void;
  onImageEntry: (uri: string) => void;
}

export function AddEntrySheet({ visible, onClose, onManualEntry, onImageEntry }: Props) {
  const { t } = useTranslation();
  const colors = useAppColors();

  function handleImageEntry() {
    Alert.alert(t('items.imageEntry'), '', [
      {
        text: t('items.takePhoto'),
        onPress: async () => {
          const uri = await pickFromCamera();
          if (uri) { onClose(); onImageEntry(uri); }
        },
      },
      {
        text: t('items.chooseFromLibrary'),
        onPress: async () => {
          const uri = await pickFromLibrary();
          if (uri) { onClose(); onImageEntry(uri); }
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <TouchableOpacity
        style={[styles.row, { backgroundColor: colors.screenBackground }]}
        onPress={handleImageEntry}
        activeOpacity={0.7}>
        <View style={[styles.icon, { backgroundColor: colors.primary + '22' }]}>
          <Text style={styles.iconText}>📷</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: colors.primaryText }]}>{t('items.imageEntry')}</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>{t('items.imageEntryDesc')}</Text>
        </View>
        <Text style={[styles.chevron, { color: colors.separator }]}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.row, { backgroundColor: colors.screenBackground }]}
        onPress={onManualEntry}
        activeOpacity={0.7}>
        <View style={[styles.icon, { backgroundColor: colors.primary + '22' }]}>
          <Text style={styles.iconText}>✏️</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: colors.primaryText }]}>{t('items.manualEntry')}</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>{t('items.manualEntryDesc')}</Text>
        </View>
        <Text style={[styles.chevron, { color: colors.separator }]}>›</Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 8,
    paddingHorizontal: 14,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  textBlock: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    marginLeft: 8,
  },
});
