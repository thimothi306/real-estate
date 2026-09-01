import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '../api/client';
import { submitCommunityReview } from '../api/insights';
import type { ReviewCategory } from '../api/types';
import { Banner, Button, Field } from '../components/ui';
import { colors, radius, shadow, spacing } from '../theme';

const CATEGORIES: { value: ReviewCategory; label: string; icon: string }[] = [
  { value: 'water_supply', label: 'Water Supply', icon: '💧' },
  { value: 'internet', label: 'Internet', icon: '📶' },
  { value: 'traffic', label: 'Traffic', icon: '🚦' },
  { value: 'safety', label: 'Safety', icon: '🛡' },
  { value: 'schools', label: 'Schools', icon: '🎓' },
  { value: 'hospitals', label: 'Hospitals', icon: '🏥' },
  { value: 'maintenance', label: 'Maintenance', icon: '🧰' },
];

export function WriteReviewScreen({ route, navigation }: any) {
  const { city, locality } = route.params as { city: string; locality?: string };

  const [category, setCategory] = useState<ReviewCategory>('water_supply');
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSaving(true);
    setError(null);

    try {
      await submitCommunityReview({ city, locality, category, rating, comment: comment.trim() || undefined });
      navigation.goBack();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your review.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {!!error && <Banner tone="error" message={error} />}

      <Text style={styles.heading}>Rate {locality ?? city}</Text>
      <Text style={styles.sub}>Your review helps others decide where to live.</Text>

      <Text style={styles.label}>What are you rating?</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((item) => {
          const selected = category === item.value;
          return (
            <Pressable
              key={item.value}
              onPress={() => setCategory(item.value)}
              style={[styles.chip, selected && styles.chipActive]}
            >
              <Text style={{ fontSize: 13 }}>{item.icon}</Text>
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Your rating</Text>
      <View style={[styles.starRow, shadow.sm]}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} onPress={() => setRating(value)} hitSlop={6}>
            <Text style={[styles.star, value <= rating ? styles.starOn : styles.starOff]}>★</Text>
          </Pressable>
        ))}
        <Text style={styles.ratingValue}>{rating}.0</Text>
      </View>

      <Field
        label="Comment (optional)"
        value={comment}
        onChangeText={setComment}
        placeholder="Share your experience living here…"
        multiline
        numberOfLines={4}
        style={styles.textArea}
        maxLength={1000}
      />

      <Button title="Submit review" onPress={handleSubmit} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heading: { fontSize: 21, fontWeight: '800', color: colors.text },
  sub: { fontSize: 13.5, color: colors.muted, marginTop: 4, marginBottom: spacing.xl },
  label: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12.5, color: colors.text, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  star: { fontSize: 30 },
  starOn: { color: colors.gold },
  starOff: { color: colors.border },
  ratingValue: { marginLeft: 'auto', fontSize: 17, fontWeight: '800', color: colors.text },
  textArea: { height: 100, textAlignVertical: 'top' },
});
