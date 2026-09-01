import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '../api/client';
import { scheduleVisit } from '../api/properties';
import { colors, radius, spacing } from '../theme';
import { Banner, Button, Field } from './ui';
import { DatePickerField } from './DatePickerField';

type Props = {
  visible: boolean;
  propertyId: number;
  onClose: () => void;
  onScheduled: () => void;
};

function defaultVisitTime(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(11, 0, 0, 0);
  return date;
}

export function VisitScheduleModal({ visible, propertyId, onClose, onScheduled }: Props) {
  const [when, setWhen] = useState(defaultVisitTime);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    setSaving(true);
    setError(null);

    try {
      await scheduleVisit(propertyId, when.toISOString(), note.trim() || undefined);
      onScheduled();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not schedule the visit.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Schedule a visit</Text>

          {!!error && <Banner tone="error" message={error} />}

          <DatePickerField label="Visit date & time" value={when} onChange={setWhen} minimumDate={new Date()} mode="datetime" />

          <Field
            label="Note (optional)"
            value={note}
            onChangeText={setNote}
            placeholder="Anything the owner should know…"
          />

          <View style={styles.actions}>
            <Button title="Cancel" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
            <Button title="Confirm visit" onPress={handleConfirm} loading={saving} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
});
