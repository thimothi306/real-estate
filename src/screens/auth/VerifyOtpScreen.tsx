import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import * as authApi from '../../api/auth';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Banner, Button, Field } from '../../components/ui';
import { colors, spacing } from '../../theme';

const RESEND_SECONDS = 30;

export function VerifyOtpScreen({ route }: any) {
  const { phone } = route.params as { phone: string };
  const { signInWithToken } = useAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  // Countdown gate on "resend" — the server also rate-limits OTP sends to
  // 3/minute, so hammering the button would just produce a 429.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  async function handleVerify() {
    if (code.length !== 6) {
      setError('Enter the 6-digit code we sent you.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authApi.verifyRegistrationOtp(phone, code);
      await signInWithToken(result.data.token, result.data.user);
      // Signed in — the root navigator switches stacks on its own.
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not verify that code.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setNotice(null);

    try {
      await authApi.sendOtp(phone, 'registration');
      setNotice('A new code is on its way.');
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resend the code.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Verify your phone</Text>
      <Text style={styles.subheading}>
        We sent a 6-digit code to <Text style={styles.phone}>{phone}</Text>.
      </Text>

      {!!error && <Banner tone="error" message={error} />}
      {!!notice && <Banner tone="success" message={notice} />}

      <Field
        label="Verification code"
        value={code}
        onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        placeholder="123456"
        maxLength={6}
        style={styles.codeInput}
      />

      <Button title="Verify and continue" onPress={handleVerify} loading={loading} />

      <Button
        title={secondsLeft > 0 ? `Resend code in ${secondsLeft}s` : 'Resend code'}
        variant="secondary"
        disabled={secondsLeft > 0}
        onPress={handleResend}
        style={{ marginTop: spacing.md }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.xl },
  heading: { fontSize: 22, fontWeight: '700', color: colors.text },
  subheading: { fontSize: 14, color: colors.muted, marginTop: 6, marginBottom: spacing.xl },
  phone: { color: colors.text, fontWeight: '600' },
  codeInput: { fontSize: 22, letterSpacing: 6, textAlign: 'center' },
});
