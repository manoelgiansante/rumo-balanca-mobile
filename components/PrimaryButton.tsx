import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';

interface Props {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  haptic?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  style,
  haptic = true,
}: Props) {
  const palette = VARIANTS[variant];
  const sz = SIZES[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={() => {
        if (isDisabled) return;
        if (haptic) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border },
        sz,
        pressed && !isDisabled && { opacity: 0.8 },
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={palette.fg} size="small" />
        ) : Icon ? (
          <Icon size={18} color={palette.fg} strokeWidth={2} />
        ) : null}
        <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const VARIANTS = {
  primary: {
    bg: Colors.primary,
    fg: Colors.surface,
    border: Colors.primary,
  },
  secondary: {
    bg: Colors.surface,
    fg: Colors.primary,
    border: Colors.primary,
  },
  ghost: {
    bg: 'transparent',
    fg: Colors.primary,
    border: 'transparent',
  },
  danger: {
    bg: Colors.error,
    fg: Colors.surface,
    border: Colors.error,
  },
} as const;

const SIZES = {
  sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, minHeight: 36 },
  md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, minHeight: 44 },
  lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl, minHeight: 56 },
} as const;

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    fontFamily: Typography.bodySemibold,
    fontSize: 15,
  },
  disabled: { opacity: 0.5 },
});
