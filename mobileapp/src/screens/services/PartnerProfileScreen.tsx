import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '../../api/client';
import { getMyPartnerProfile, updatePartnerProfile } from '../../api/partners';
import { getServiceCategories, type ServiceCategory } from '../../api/services';
import { Badge, Banner, Button, Field, Loading } from '../../components/ui';
import { colors, radius, spacing } from '../../theme';

export function PartnerProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [profession, setProfession] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getMyPartnerProfile(), getServiceCategories()])
      .then(([profile, cats]) => {
        setCategories(cats);

        if (profile) {
          setProfession(profile.profession ?? '');
          setBusinessName(profile.business_name);
          setBio(profile.bio ?? '');
          setCity(profile.cities_served?.[0] ?? '');
          setYearsExperience(profile.years_experience ?? '');
          setSelectedCategoryIds(profile.categories?.map((c) => c.id) ?? []);
          setIsVerified(profile.is_verified);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load your profile.'))
      .finally(() => setLoading(false));
  }, []);

  function toggleCategory(id: number) {
    setSelectedCategoryIds((current) => (current.includes(id) ? current.filter((c) => c !== id) : [...current, id]));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      await updatePartnerProfile({
        profession: profession.trim(),
        business_name: businessName.trim(),
        bio: bio.trim() || undefined,
        cities_served: city.trim() ? [city.trim()] : undefined,
        years_experience: yearsExperience.trim() || undefined,
        category_ids: selectedCategoryIds,
      });
      setNotice('Profile saved. An admin will review it for verification.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {isVerified ? (
          <Badge label="Verified partner" tone="success" />
        ) : (
          <Badge label="Awaiting verification" tone="warning" />
        )}

        {!!error && <Banner tone="error" message={error} />}
        {!!notice && <Banner tone="success" message={notice} />}

        <Field label="Primary profession" value={profession} onChangeText={setProfession} placeholder="e.g. Plumber, Electrician, House Maid" />
        <Field label="Business name" value={businessName} onChangeText={setBusinessName} placeholder="Your business or trade name" />
        <Field label="Bio" value={bio} onChangeText={setBio} multiline placeholder="Tell buyers about your experience" />
        <Field label="City you serve" value={city} onChangeText={setCity} placeholder="Hyderabad" />
        <Field label="Years of experience" value={yearsExperience} onChangeText={setYearsExperience} keyboardType="number-pad" placeholder="5" />

        <Text style={styles.groupLabel}>Categories you serve</Text>
        <View style={styles.chipRow}>
          {categories.map((cat) => {
            const selected = selectedCategoryIds.includes(cat.id);
            return (
              <Pressable
                key={cat.id}
                onPress={() => toggleCategory(cat.id)}
                style={[styles.chip, selected && styles.chipActive]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextActive]}>{cat.name}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.note}>Only categories your account type is eligible for will be saved.</Text>

        <Button title="Save profile" onPress={handleSave} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
  groupLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
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
  note: { fontSize: 11.5, color: colors.muted, marginBottom: spacing.lg },
});
