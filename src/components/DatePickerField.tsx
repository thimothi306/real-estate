import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { colors, radius, spacing } from '../theme';

type Props = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  mode?: 'date' | 'datetime';
};

export function DatePickerField({ label, value, onChange, minimumDate, mode = 'date' }: Props) {
  const [open, setOpen] = useState(false);

  const displayText =
    mode === 'datetime'
      ? value.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      : value.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.input} onPress={() => setOpen(true)}>
        <Text style={styles.value}>{displayText}</Text>
      </Pressable>

      {open && (
        <DateTimePicker
          value={value}
          mode={mode}
          minimumDate={minimumDate}
          onChange={(event, selected) => {
            // Android closes the picker itself after a choice; iOS keeps it
            // inline, so only auto-close on Android to match each platform's convention.
            if (Platform.OS === 'android') setOpen(false);
            if (event.type !== 'dismissed' && selected) onChange(selected);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  value: { fontSize: 15, color: colors.text },
});
