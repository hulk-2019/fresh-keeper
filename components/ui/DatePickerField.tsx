import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { BottomSheet } from './BottomSheet';
import { useAppColors } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

interface Props {
  label: string;
  value: string;        // ISO date string "YYYY-MM-DD", or ""
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
}

function toDate(s: string): Date {
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function DatePickerField({ label, value, onChange, placeholder, required, minimumDate, maximumDate }: Props) {
  const colors = useAppColors();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Date>(value ? toDate(value) : new Date());

  function handleOpen() {
    setPending(value ? toDate(value) : new Date());
    setOpen(true);
  }

  function handleChange(_: DateTimePickerEvent, date?: Date) {
    if (date) setPending(date);
  }

  function handleConfirm() {
    onChange(toISO(pending));
    setOpen(false);
  }

  function handleClear() {
    onChange('');
    setOpen(false);
  }

  const displayText = value
    ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(toDate(value))
    : undefined;

  return (
    <View>
      <Text style={[styles.label, { color: colors.secondaryText }]}>
        {label}{required ? ' *' : ''}
      </Text>
      <TouchableOpacity
        style={[styles.field, { backgroundColor: colors.inputBackground }]}
        onPress={handleOpen}
        activeOpacity={0.7}>
        <Text style={[styles.fieldText, !displayText && styles.placeholder, { color: displayText ? colors.primaryText : colors.secondaryText }]}>
          {displayText ?? (placeholder || t('common.selectDate'))}
        </Text>
        <Text style={[styles.chevron, { color: colors.secondaryText }]}>›</Text>
      </TouchableOpacity>

      <BottomSheet visible={open} onClose={() => setOpen(false)}>
        <DateTimePicker
          value={pending}
          mode="date"
          display="spinner"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          style={styles.picker}
          textColor={colors.primaryText}
        />
        <View style={styles.actions}>
          {!required && (
            <TouchableOpacity style={[styles.clearBtn, { backgroundColor: colors.screenBackground }]} onPress={handleClear}>
              <Text style={[styles.clearText, { color: colors.secondaryText }]}>{t('common.clear')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.primary }]} onPress={handleConfirm}>
            <Text style={styles.confirmText}>{t('common.confirm')}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  field: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldText: { flex: 1, fontSize: 16 },
  placeholder: {},
  chevron: { fontSize: 20 },
  picker: { width: '100%' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  clearBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  clearText: { fontSize: 16, fontWeight: '500' },
  confirmBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  confirmText: { fontSize: 16, color: '#fff', fontWeight: '600' },
});
