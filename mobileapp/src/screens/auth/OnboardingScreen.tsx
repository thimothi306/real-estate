import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { API_BASE_URL } from '../../api/config';
import { colors, darkColors, radius, spacing } from '../../theme';

/** Storage assets sit outside the /api/v1 prefix. */
const ASSET_BASE = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
const HERO_IMAGE = `${ASSET_BASE}/storage/property-images/estate-04.jpg`;

export function OnboardingScreen({ navigation }: any) {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ImageBackground source={{ uri: HERO_IMAGE }} style={styles.hero} imageStyle={styles.heroImage}>
        {/* Scrim keeps the wordmark legible whatever the photo behind it. */}
        <View style={styles.scrim} />

        <View style={styles.brandBlock}>
          <View style={styles.logoMark}>
            <Text style={styles.logoGlyph}>🏛</Text>
          </View>
          <Text style={styles.wordmark}>KAVURI</Text>
          <View style={styles.rule} />
          <Text style={styles.subMark}>ESTATES</Text>

          <Text style={styles.tagline}>One App for Every{'\n'}Property Need</Text>
        </View>
      </ImageBackground>

      <View style={styles.actions}>
        <Pressable
          onPress={() => navigation.navigate('Register')}
          style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.88 }]}
        >
          <Text style={styles.primaryText}>Get Started</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Login')}
          style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.secondaryText}>Sign In</Text>
        </Pressable>

        <Text style={styles.trustLine}>Trusted. Verified. Hassle-Free.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: darkColors.bg },
  hero: { flex: 1, justifyContent: 'center' },
  heroImage: { resizeMode: 'cover' },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(8,18,36,0.78)' },
  brandBlock: { alignItems: 'center', paddingHorizontal: spacing.xl },
  logoMark: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoGlyph: { fontSize: 34 },
  wordmark: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 6 },
  rule: { width: 120, height: 1, backgroundColor: colors.gold, marginVertical: 8 },
  subMark: { fontSize: 12, fontWeight: '700', color: colors.gold, letterSpacing: 7 },
  tagline: {
    fontSize: 19,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 27,
    marginTop: spacing.xxl,
  },
  actions: { padding: spacing.xl, gap: spacing.md, backgroundColor: darkColors.bg },
  primaryButton: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: { color: '#0d1b33', fontSize: 15.5, fontWeight: '800' },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryText: { color: '#fff', fontSize: 15.5, fontWeight: '700' },
  trustLine: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
    letterSpacing: 0.3,
  },
});
