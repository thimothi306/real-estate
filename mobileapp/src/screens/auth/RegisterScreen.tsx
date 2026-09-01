import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import * as authApi from '../../api/auth';
import { ApiError } from '../../api/client';
import type { Role } from '../../api/types';
import { Banner, Button, Field } from '../../components/ui';
import { colors, radius, spacing } from '../../theme';

/** Roles a person can self-select at signup. Admin is assigned, not self-selected. */
const SELECTABLE_ROLES: { value: Role; label: string; hint: string }[] = [
  { value: 'buyer', label: 'Buyer', hint: 'Looking to buy a property' },
  { value: 'tenant', label: 'Tenant', hint: 'Looking to rent' },
  { value: 'owner', label: 'Owner', hint: 'I want to sell or rent out' },
  { value: 'agent', label: 'Agent', hint: 'I work with clients' },
  { value: 'builder', label: 'Builder', hint: 'I launch projects' },
  { value: 'interior_designer', label: 'Interior Designer', hint: 'I offer design services' },
  { value: 'loan_partner', label: 'Home Loan Partner', hint: 'I offer loan assistance' },
  { value: 'legal_consultant', label: 'Legal Consultant', hint: 'I offer legal verification' },
  { value: 'property_manager', label: 'Property Manager', hint: 'I manage properties' },
  { value: 'rental_manager', label: 'Rental Manager', hint: 'I manage rentals' },
  { value: 'packers_movers', label: 'Packers & Movers', hint: 'I offer moving services' },
  { value: 'govt_registration_partner', label: 'Registration Partner', hint: 'I assist with registration' },
];

export function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('buyer');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ password_confirmation: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    try {
      await authApi.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        password_confirmation: confirmPassword,
        role,
      });

      navigation.navigate('VerifyOtp', { phone: phone.trim() });
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        // Surface the server's per-field validation messages inline.
        const mapped: Record<string, string> = {};
        for (const [field, messages] of Object.entries(err.errors)) {
          mapped[field] = messages[0];
        }
        setFieldErrors(mapped);
        setError('Please fix the highlighted fields.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Create your account</Text>
        <Text style={styles.subheading}>We'll send a one-time code to verify your phone.</Text>

        {!!error && <Banner tone="error" message={error} />}

        <Field label="Full name" value={name} onChangeText={setName} error={fieldErrors.name} placeholder="Your name" />

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={fieldErrors.email}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
        />

        <Field
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          error={fieldErrors.phone}
          keyboardType="phone-pad"
          placeholder="+919876543210"
        />

        <Text style={styles.fieldLabel}>I am a</Text>
        <View style={styles.roleGrid}>
          {SELECTABLE_ROLES.map((option) => {
            const selected = role === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => setRole(option.value)}
                style={[styles.roleChip, selected && styles.roleChipSelected]}
              >
                <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>{option.label}</Text>
                <Text style={[styles.roleHint, selected && styles.roleHintSelected]}>{option.hint}</Text>
              </Pressable>
            );
          })}
        </View>

        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          secureTextEntry
          placeholder="At least 8 characters"
        />
        <Text style={styles.hint}>
          Must include upper and lower case letters, a number, and a symbol.
        </Text>

        <Field
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={fieldErrors.password_confirmation}
          secureTextEntry
          placeholder="Re-enter your password"
        />

        <Button title="Create account" onPress={handleSubmit} loading={loading} />

        <Button
          title="I already have an account"
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.xl, paddingBottom: spacing.xxl },
  heading: { fontSize: 22, fontWeight: '700', color: colors.text },
  subheading: { fontSize: 13.5, color: colors.muted, marginTop: 4, marginBottom: spacing.xl },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 6 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  roleChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: '47%',
  },
  roleChipSelected: { borderColor: colors.primary, backgroundColor: '#eaf1fd' },
  roleLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
  roleLabelSelected: { color: colors.primary },
  roleHint: { fontSize: 11.5, color: colors.muted, marginTop: 2 },
  roleHintSelected: { color: colors.primary },
  hint: { fontSize: 12, color: colors.muted, marginTop: -spacing.md, marginBottom: spacing.lg },
});
