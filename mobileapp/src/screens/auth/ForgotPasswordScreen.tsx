import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';

import * as authApi from '../../api/auth';
import { ApiError } from '../../api/client';
import { Banner, Button, Field } from '../../components/ui';
import { colors, spacing } from '../../theme';

export function ForgotPasswordScreen({ navigation }: any) {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [phone, setPhone] = useState('+91');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRequest() {
    setLoading(true);
    setError(null);

    try {
      await authApi.forgotPassword(phone.trim());
      setNotice('If an account exists for that number, a code has been sent.');
      setStep('reset');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send a reset code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    setLoading(true);
    setError(null);

    try {
      await authApi.resetPassword(phone.trim(), otpCode, password);
      navigation.navigate('Login');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reset your password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Reset your password</Text>
        <Text style={styles.subheading}>
          {step === 'request'
            ? "Enter your registered phone number and we'll send a reset code."
            : 'Enter the code we sent along with your new password.'}
        </Text>

        {!!error && <Banner tone="error" message={error} />}
        {!!notice && <Banner tone="success" message={notice} />}

        <Field
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+919876543210"
          editable={step === 'request'}
        />

        {step === 'reset' && (
          <>
            <Field
              label="Reset code"
              value={otpCode}
              onChangeText={(text) => setOtpCode(text.replace(/\D/g, '').slice(0, 6))}
              keyboardType="number-pad"
              placeholder="123456"
              maxLength={6}
            />
            <Field
              label="New password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="At least 8 characters"
            />
            <Text style={styles.hint}>
              Resetting signs you out everywhere else for safety.
            </Text>
          </>
        )}

        <Button
          title={step === 'request' ? 'Send reset code' : 'Set new password'}
          onPress={step === 'request' ? handleRequest : handleReset}
          loading={loading}
        />

        <Button
          title="Back to sign in"
          variant="secondary"
          onPress={() => navigation.navigate('Login')}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.xl, flexGrow: 1 },
  heading: { fontSize: 22, fontWeight: '700', color: colors.text },
  subheading: { fontSize: 13.5, color: colors.muted, marginTop: 6, marginBottom: spacing.xl },
  hint: { fontSize: 12, color: colors.muted, marginTop: -spacing.md, marginBottom: spacing.lg },
});
