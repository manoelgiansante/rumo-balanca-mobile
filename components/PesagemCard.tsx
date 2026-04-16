import { router } from 'expo-router';
import { ArrowRight, Truck } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import type { BalaPesagem } from '../types/database';
import { formatHora, formatPeso, formatTicket } from '../utils/format';
import { StatusBadgeBala } from './StatusBadgeBala';

interface Props {
  pesagem: BalaPesagem;
}

function PesagemCardImpl({ pesagem }: Props) {
  const pesoPrincipal =
    pesagem.peso_final_kg ??
    pesagem.peso_liquido_kg ??
    pesagem.peso_bruto_kg ??
    null;

  const navegar = () => {
    router.push({ pathname: '/pesagem/[id]', params: { id: pesagem.id } });
  };

  return (
    <Pressable
      onPress={navegar}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Pesagem ${formatTicket(pesagem.numero_ticket)} - ${pesagem.placa}`}
    >
      <View style={styles.row}>
        <View style={styles.iconCircle}>
          <Truck size={18} color={Colors.primary} strokeWidth={1.75} />
        </View>
        <View style={styles.mainCol}>
          <View style={styles.topRow}>
            <Text style={styles.ticket}>{formatTicket(pesagem.numero_ticket)}</Text>
            <StatusBadgeBala status={pesagem.status} compact />
          </View>
          <Text style={styles.placa}>{pesagem.placa}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {pesagem.produto_nome} • {pesagem.motorista_nome}
          </Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.peso}>{formatPeso(pesoPrincipal)}</Text>
          <Text style={styles.hora}>
            {formatHora(pesagem.tara_em ?? pesagem.bruta_em ?? pesagem.entrada_em)}
          </Text>
          <ArrowRight size={14} color={Colors.muted} strokeWidth={1.75} />
        </View>
      </View>
    </Pressable>
  );
}

export const PesagemCard = memo(PesagemCardImpl);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  pressed: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCol: { flex: 1, gap: 2 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  ticket: {
    fontFamily: Typography.bodySemibold,
    fontSize: 13,
    color: Colors.accent,
    letterSpacing: 0.4,
  },
  placa: {
    fontFamily: Typography.bodyBold,
    fontSize: 15,
    color: Colors.text,
    letterSpacing: 1,
  },
  meta: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.textMuted,
  },
  rightCol: { alignItems: 'flex-end', gap: 2 },
  peso: {
    fontFamily: Typography.bodyBold,
    fontSize: 15,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  hora: {
    fontFamily: Typography.body,
    fontSize: 11,
    color: Colors.muted,
  },
});
