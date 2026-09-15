import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '../../api/client';
import { createServiceRequest, type ServiceCategory } from '../../api/services';
import { Banner, Button, Field } from '../../components/ui';
import { colors, radius, spacing } from '../../theme';

const URGENCY_OPTIONS: { value: 'immediate' | 'today' | 'tomorrow' | 'this_week'; label: string }[] = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'this_week', label: 'This week' },
];

export function PostServiceRequestScreen({ navigation, route }: any) {
  const { category } = route.params as { category: ServiceCategory };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [urgency, setUrgency] = useState<'immediate' | 'today' | 'tomorrow' | 'this_week'>('this_week');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    setFieldErrors({});

    try {
      await createServiceRequest({
        service_category_id: category.id,
        title: title.trim(),
        description: description.trim() || undefined,
        budget_min: budgetMin ? Number(budgetMin.replace(/\D/g, '')) : undefined,
        budget_max: budgetMax ? Number(budgetMax.replace(/\D/g, '')) : undefined,
        urgency,
        location: location.trim() || undefined,
      });

      navigation.replace('MyServiceRequests');
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        const mapped: Record<string, string> = {};
        for (const [field, messages] of Object.entries(err.errors)) mapped[field] = messages[0];
        setFieldErrors(mapped);
        setError('Please fix the highlighted fields.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not post this request.');
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>{category.name}</Text>
        <Text style={styles.subheading}>
          Describe what you need — verified partners in this category will send you quotes.
        </Text>

        {!!error && <Banner tone="error" message={error} />}

        <Field
          label="Title"
          value={title}
          onChangeText={setTitle}
          error={fieldErrors.title}
          placeholder="e.g. Manage my 2BHK rental in Kondapur"
        />

        <Field
          label="Details"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what you need done…"
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />

        <Field
          label="Budget min (₹, optional)"
          value={budgetMin}
          onChangeText={setBudgetMin}
          keyboardType="number-pad"
          placeholder="2000"
        />
        <Field
          label="Budget max (₹, optional)"
          value={budgetMax}
          onChangeText={setBudgetMax}
          keyboardType="number-pad"
          placeholder="5000"
        />

        <Text style={styles.groupLabel}>Urgency</Text>
        <View style={styles.chipRow}>
          {URGENCY_OPTIONS.map((option) => {
            const selected = urgency === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setUrgency(option.value)}
                style={[styles.chip, selected && styles.chipActive]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextActive]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Field
          label="Location (optional)"
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Kondapur, Hyderabad"
        />

        <Button title="Post request" onPress={handleSubmit} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heading: { fontSize: 21, fontWeight: '700', color: colors.text },
  subheading: { fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: spacing.xl, lineHeight: 18 },
  textArea: { height: 100, textAlignVertical: 'top' },
  groupLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12.5, color: colors.text },
  chipTextActive: { color: '#fff', fontWeight: '600' },
});
