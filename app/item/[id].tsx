import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useItemDetail } from '@/hooks/useItemDetail';
import { useTags } from '@/hooks/useTags';
import { DaysLeftBadge } from '@/components/ui/DaysLeftBadge';
import { useAppColors } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';

function formatDate(dateStr: string, language: string): string {
  const locale = language === 'zh' ? 'zh-CN' : 'en-US';
  const d = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
}

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useAppColors();
  const { language } = useI18n();
  const { item, loading, archiveItem, deleteItem } = useItemDetail(id);
  const { tags, loading: tagsLoading } = useTags();

  const itemTags = tags.filter(t => item?.tagIds?.includes(t.id));
  const tagColor = itemTags[0]?.color ?? colors.primary;
  const lang = language === 'system' ? 'en' : language;

  function statusLabel(status: string): string {
    if (status === 'fresh') return t('items.fresh');
    if (status === 'expiring') return t('items.expiringSoon');
    return t('items.expired');
  }

  function statusColor(status: string): string {
    if (status === 'fresh') return colors.fresh;
    if (status === 'expiring') return colors.expiring;
    return colors.expired;
  }

  function handleArchive() {
    Alert.alert(t('itemDetail.archiveTitle'), t('itemDetail.archiveMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.archive'), onPress: async () => { await archiveItem(); router.back(); } },
    ]);
  }

  function handleDelete() {
    Alert.alert(t('itemDetail.deleteTitle'), t('itemDetail.deleteMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: async () => { await deleteItem(); router.back(); } },
    ]);
  }

  if (loading || tagsLoading || !item) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.screenBackground }]} edges={['top']}>
        <View style={styles.loadingRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={[styles.backBtn, { color: colors.primary }]}>‹ {t('common.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.screenBackground }]} edges={['top']}>
      <View style={[styles.navBar, { backgroundColor: colors.navBackground, borderBottomColor: colors.separator }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={[styles.backBtn, { color: colors.primary }]}>‹ {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.primaryText }]} numberOfLines={1}>{item.name}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: tagColor + '22' }]}>
          {item.photoUri ? (
            <Image source={{ uri: item.photoUri }} style={styles.heroImage} contentFit="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <View style={[styles.heroIcon, { backgroundColor: tagColor }]} />
            </View>
          )}
          <View style={styles.heroOverlay}>
            <Text style={[styles.heroName, { color: colors.primaryText }]}>{item.name}</Text>
            <DaysLeftBadge daysLeft={item.daysLeft} status={item.status} size="large" />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>{t('itemDetail.itemInfo')}</Text>
          <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: statusColor(item.status) }]} />
            <Text style={[styles.rowLabel, { color: colors.primaryText }]}>{t('itemDetail.status')}</Text>
            <Text style={[styles.rowValue, { color: statusColor(item.status) }]}>{statusLabel(item.status)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.separator }]} />
          <View style={styles.row}>
            <Text style={styles.rowIcon}>⏳</Text>
            <Text style={[styles.rowLabel, { color: colors.primaryText }]}>{t('itemDetail.daysLeft')}</Text>
            <Text style={[styles.rowValue, { color: colors.secondaryText }]}>
              {item.daysLeft <= 0 ? t('items.expired') : `${item.daysLeft} days left`}
            </Text>
          </View>
          {itemTags.length > 0 && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.separator }]} />
              <View style={styles.row}>
                <View style={[styles.catDot, { backgroundColor: itemTags[0].color }]} />
                <Text style={[styles.rowLabel, { color: colors.primaryText }]}>{t('itemDetail.category')}</Text>
                <View style={styles.tagChips}>
                  {itemTags.map(tag => (
                    <View key={tag.id} style={[styles.tagChip, { backgroundColor: tag.color + '22', borderColor: tag.color }]}>
                      <Text style={[styles.tagChipText, { color: tag.color }]}>{tag.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>{t('itemDetail.dates')}</Text>
          {item.productionDate && (
            <>
              <View style={styles.row}>
                <Text style={styles.rowIcon}>📅</Text>
                <Text style={[styles.rowLabel, { color: colors.primaryText }]}>{t('itemDetail.productionDate')}</Text>
                <Text style={[styles.rowValue, { color: colors.secondaryText }]}>{formatDate(item.productionDate, lang)}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.separator }]} />
            </>
          )}
          <View style={styles.row}>
            <Text style={styles.rowIcon}>📅</Text>
            <Text style={[styles.rowLabel, { color: colors.primaryText }]}>{t('itemDetail.expiryDate')}</Text>
            <Text style={[styles.rowValue, { color: colors.secondaryText }]}>{formatDate(item.expiryDate, lang)}</Text>
          </View>
        </View>

        {item.notes ? (
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.secondaryText }]}>{t('itemDetail.notes')}</Text>
            <Text style={[styles.notes, { color: colors.primaryText }]}>{item.notes}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.archiveBtn, { backgroundColor: colors.cardBackground, borderColor: colors.separator }]}
            onPress={handleArchive} activeOpacity={0.7}>
            <Text style={[styles.archiveBtnText, { color: colors.primaryText }]}>{t('common.archive')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteBtn, { backgroundColor: colors.expired + '15' }]}
            onPress={handleDelete} activeOpacity={0.7}>
            <Text style={[styles.deleteBtnText, { color: colors.expired }]}>{t('common.delete')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingRow: { paddingHorizontal: 16, paddingVertical: 12 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { fontSize: 17, width: 60 },
  navTitle: { flex: 1, fontSize: 17, fontWeight: '600', textAlign: 'center' },
  hero: { height: 220, position: 'relative', overflow: 'hidden' },
  heroImage: { ...StyleSheet.absoluteFillObject },
  heroPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroIcon: { width: 64, height: 64, borderRadius: 32, opacity: 0.5 },
  heroOverlay: {
    position: 'absolute',
    bottom: 16, left: 16, right: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroName: { fontSize: 22, fontWeight: '700', flex: 1, marginRight: 12 },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.4,
    paddingVertical: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  catDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  rowIcon: { fontSize: 16, marginRight: 10, width: 20, textAlign: 'center' },
  rowLabel: { flex: 1, fontSize: 16 },
  rowValue: { fontSize: 16, fontWeight: '500' },
  tagChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' },
  tagChip: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  tagChipText: { fontSize: 13, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 30 },
  notes: { fontSize: 15, lineHeight: 22, paddingBottom: 14 },
  actions: {
    flexDirection: 'row', gap: 12,
    marginHorizontal: 16, marginTop: 24, marginBottom: 40,
  },
  archiveBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1,
  },
  archiveBtnText: { fontSize: 16, fontWeight: '600' },
  deleteBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  deleteBtnText: { fontSize: 16, fontWeight: '600' },
});
