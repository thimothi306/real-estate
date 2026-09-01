import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { colors, radius, shadow, spacing, type } from '../theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }: ButtonProps) {
  const isDisabled = disabled || loading;

  const background =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
      ? colors.danger
      : variant === 'ghost'
      ? 'transparent'
      : colors.surface;
  const textColor = variant === 'secondary' || variant === 'ghost' ? colors.text : '#fff';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: isDisabled ? 0.5 : pressed ? 0.82 : 1 },
        variant === 'secondary' && styles.buttonOutline,
        variant === 'primary' && !isDisabled && shadow.sm,
        variant === 'ghost' && styles.buttonGhost,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function Field({ label, error, style, ...inputProps }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.faint}
        {...inputProps}
        style={[styles.input, !!error && styles.inputError, style]}
      />
      {!!error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

export function Card({ children, style, elevated }: { children: React.ReactNode; style?: ViewStyle; elevated?: boolean }) {
  return <View style={[styles.card, elevated && shadow.sm, style]}>{children}</View>;
}

export function Banner({ tone, message }: { tone: 'error' | 'success' | 'info'; message: string }) {
  const toneStyle =
    tone === 'error'
      ? { bg: colors.dangerBg, fg: colors.danger }
      : tone === 'success'
      ? { bg: colors.successBg, fg: colors.success }
      : { bg: colors.surfaceAlt, fg: colors.muted };

  return (
    <View style={[styles.banner, { backgroundColor: toneStyle.bg }]}>
      <Text style={{ color: toneStyle.fg, fontSize: 13.5, fontWeight: '500' }}>{message}</Text>
    </View>
  );
}

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Loading({ label }: { label?: string }) {
  return (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.primary} size="large" />
      {!!label && <Text style={styles.mutedText}>{label}</Text>}
    </View>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon?: string; title: string; subtitle?: string }) {
  return (
    <View style={styles.centered}>
      {!!icon && (
        <View style={styles.emptyIconWrap}>
          <Text style={styles.emptyIcon}>{icon}</Text>
        </View>
      )}
      <Text style={styles.emptyTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.mutedText}>{subtitle}</Text>}
    </View>
  );
}

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'primary' }) {
  const palette = {
    neutral: { bg: colors.surfaceAlt, fg: colors.muted },
    success: { bg: colors.successBg, fg: colors.success },
    warning: { bg: colors.warningBg, fg: colors.warning },
    danger: { bg: colors.dangerBg, fg: colors.danger },
    primary: { bg: colors.primarySoft, fg: colors.primary },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={{ color: palette.fg, fontSize: 11, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

/** Circular tinted icon chip used on category tiles, list rows, and section headers. */
export function IconChip({ glyph, bg, fg, size = 44 }: { glyph: string; bg: string; fg?: string; size?: number }) {
  return (
    <View style={[styles.iconChip, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={{ fontSize: size * 0.46, color: fg }}>{glyph}</Text>
    </View>
  );
}

/** Thin section title with an optional trailing action link — used above list sections app-wide. */
export function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!actionLabel && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.link}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  button: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonOutline: { borderWidth: 1.5, borderColor: colors.border },
  buttonGhost: { minHeight: 'auto' as any, paddingVertical: 8 },
  buttonText: { fontSize: 15, fontWeight: '700' },
  field: { marginBottom: spacing.lg },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 7 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  inputError: { borderColor: colors.danger },
  fieldError: { color: colors.danger, fontSize: 12.5, marginTop: 4 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  banner: { padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.lg },
  mutedText: { color: colors.muted, fontSize: 13.5, textAlign: 'center', lineHeight: 19 },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyIcon: { fontSize: 28 },
  emptyTitle: { ...type.h2, color: colors.text },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  iconChip: { alignItems: 'center', justifyContent: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...type.h2, color: colors.text },
  link: { color: colors.primary, fontSize: 13.5, fontWeight: '700' },
});
