import { StyleSheet, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import type { StatusPesagem } from '../types/database';

interface Props {
  status: StatusPesagem;
  compact?: boolean;
  style?: ViewStyle;
}

const LABELS: Record<StatusPesagem, string> = {
  aguardando: 'Aguardando',
  pesagem_bruta: 'Pesado bruto',
  pesagem_tara: 'Pesado tara',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

const COLORS: Record<StatusPesagem, { bg: string; fg: string }> = {
  aguardando: { bg: Colors.warningSoft, fg: Colors.warning },
  pesagem_bruta: { bg: Colors.infoSoft, fg: Colors.info },
  pesagem_tara: { bg: Colors.infoSoft, fg: Colors.info },
  concluida: { bg: Colors.successSoft, fg: Colors.success },
  cancelada: { bg: Colors.errorSoft, fg: Colors.error },
};

export function StatusBadgeBala({ status, compact, style }: Props) {
  const palette = COLORS[status];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: palette.bg },
        compact && styles.compact,
        style,
      ]}
    >
      <Text style={[styles.text, { color: palette.fg }, compact && styles.textCompact]}>
        {LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  compact: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontFamily: Typography.bodySemibold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  textCompact: {
    fontSize: 10,
  },
});
