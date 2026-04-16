import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';

interface Props {
  label: string;
  value: string | number;
  caption?: string;
  tone?: 'neutral' | 'positive' | 'warning' | 'info';
  style?: ViewStyle;
}

const TONE_MAP = {
  neutral: Colors.primary,
  positive: Colors.success,
  warning: Colors.warning,
  info: Colors.info,
} as const;

export function KpiBala({ label, value, caption, tone = 'neutral', style }: Props) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: TONE_MAP[tone] }]}>{value}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
    minHeight: 92,
    justifyContent: 'center',
  },
  label: {
    fontFamily: Typography.bodyMedium,
    fontSize: 11,
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    fontFamily: Typography.display,
    fontSize: 24,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  caption: {
    fontFamily: Typography.body,
    fontSize: 11,
    color: Colors.textMuted,
  },
});
