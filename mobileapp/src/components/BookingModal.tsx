import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '../api/client';
import { createBooking, getAvailability } from '../api/properties';
import type { AvailabilityBlock } from '../api/types';
import { colors, radius, spacing } from '../theme';
import { Banner, Button, Field } from './ui';
import { DatePickerField } from './DatePickerField';

type Props = {
  visible: boolean;
  propertyId: number;
  onClose: () => void;
  onBooked: () => void;
};

function tomorrow(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date;
}

function daysAfter(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function BookingModal({ visible, propertyId, onClose, onBooked }: Props) {
  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(() => daysAfter(tomorrow(), 1));
  const [note, setNote] = useState('');
  const [existing, setExisting] = useState<AvailabilityBlock[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;

    getAvailability(propertyId)
      .then(setExisting)
      .catch(() => {
        // Non-critical — booking still works, the overlap just won't be pre-shown.
      });
  }, [visible, propertyId]);

  async function handleConfirm() {
    if (endDate < startDate) {
      setError('End date must be on or after the start date.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createBooking(propertyId, toDateOnly(startDate), toDateOnly(endDate), note.trim() || undefined);
      onBooked();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Those dates are not available.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Request a booking</Text>

          {!!error && <Banner tone="error" message={error} />}

          {existing.length > 0 && (
            <Banner
              tone="info"
              message={`Already booked: ${existing
                .map((b) => `${b.start_date.slice(0, 10)} – ${b.end_date.slice(0, 10)}`)
                .join(', ')}`}
            />
          )}

          <DatePickerField label="Check-in" value={startDate} onChange={setStartDate} minimumDate={new Date()} />
          <DatePickerField label="Check-out" value={endDate} onChange={setEndDate} minimumDate={startDate} />

          <Field
            label="Note (optional)"
            value={note}
            onChangeText={setNote}
            placeholder="Number of guests, purpose, etc."
          />

          <View style={styles.actions}>
            <Button title="Cancel" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
            <Button title="Request booking" onPress={handleConfirm} loading={saving} style={{ flex: 1 }} />
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
