import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Banner, Button, Field } from '../../components/ui';
import { colors, spacing } from '../../theme';

export function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!identifier.trim() || !password) {
      setError('Enter your email or phone and your password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signIn(identifier.trim(), password);
      // On success the navigator swaps to the signed-in stack automatically.
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>Kavuri Estates</Text>
          <Text style={styles.tagline}>One app for every property need</Text>
        </View>

        {!!error && <Banner tone="error" message={error} />}

        <Field
          label="Email or phone"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
        />

        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Your password"
        />

        <Button title="Sign in" onPress={handleSubmit} loading={loading} />

        <Button
          title="Forgot password?"
          variant="secondary"
          onPress={() => navigation.navigate('ForgotPassword')}
          style={{ marginTop: spacing.md }}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Kavuri Estates?</Text>
          <Button
            title="Create an account"
            variant="secondary"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.xl, paddingTop: spacing.xxl * 2, flexGrow: 1 },
  header: { marginBottom: spacing.xxl },
  brand: { fontSize: 26, fontWeight: '700', color: colors.text },
  tagline: { fontSize: 14, color: colors.muted, marginTop: 4 },
  footer: { marginTop: 'auto', paddingTop: spacing.xxl, gap: spacing.md },
  footerText: { textAlign: 'center', color: colors.muted, fontSize: 13.5 },
});
