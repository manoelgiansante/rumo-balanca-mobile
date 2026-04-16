import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Printer,
  Share2,
  Truck,
  XCircle,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { StatusBadgeBala } from '../../../components/StatusBadgeBala';
import { Colors, Radius, Shadows, Spacing, Typography } from '../../../constants/theme';
import { getEmpresaConfig } from '../../../lib/empresa-config';
import { shareTicketPDF, printTicket } from '../../../lib/ticket-pdf';
import { useBalancaPesagemStore } from '../../../stores/useBalancaPesagemStore';
import type { BalaPesagem } from '../../../types/database';
import {
  formatDateTimeBR,
  formatPeso,
  formatTicket,
} from '../../../utils/format';

export default function PesagemDetailScreen() {
  const { id, success } = useLocalSearchParams<{ id: string; success?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const store = useBalancaPesagemStore();

  const [pesagem, setPesagem] = useState<BalaPesagem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(success === 'true');
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const row = await store.fetchById(id);
      setPesagem(row);
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleCancel = useCallback(() => {
    if (!pesagem) return;
    Alert.alert(
      'Cancelar Pesagem',
      'Tem certeza que deseja cancelar esta pesagem? Esta acao nao pode ser desfeita.',
      [
        { text: 'Nao', style: 'cancel' },
        {
          text: 'Cancelar Pesagem',
          style: 'destructive',
          onPress: async () => {
            await store.cancelar(pesagem.id, 'Cancelada pelo operador');
            const updated = await store.fetchById(pesagem.id);
            setPesagem(updated);
          },
        },
      ]
    );
  }, [pesagem, store]);

  const handleSharePdf = useCallback(async () => {
    if (!pesagem) return;
    setPdfLoading(true);
    try {
      const opts = await getEmpresaConfig();
      await shareTicketPDF(pesagem, opts);
    } catch (err) {
      Alert.alert('Erro', 'Falha ao gerar PDF. Tente novamente.');
    } finally {
      setPdfLoading(false);
    }
  }, [pesagem]);

  const handlePrint = useCallback(async () => {
    if (!pesagem) return;
    setPdfLoading(true);
    try {
      const opts = await getEmpresaConfig();
      await printTicket(pesagem, opts);
    } catch (err) {
      Alert.alert('Erro', 'Impressao indisponivel.');
    } finally {
      setPdfLoading(false);
    }
  }, [pesagem]);

  const canCancel = useMemo(
    () =>
      pesagem != null &&
      pesagem.status !== 'concluida' &&
      pesagem.status !== 'cancelada',
    [pesagem]
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!pesagem) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <AlertCircle size={48} color={Colors.muted} strokeWidth={1.5} />
        <Text style={styles.emptyText}>Pesagem nao encontrada</Text>
        <PrimaryButton
          label="Voltar"
          onPress={() => router.back()}
          variant="secondary"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Success toast */}
      {showSuccess ? (
        <View style={styles.successToast}>
          <Text style={styles.successText}>Pesagem concluida com sucesso!</Text>
        </View>
      ) : null}

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <ArrowLeft size={20} color={Colors.text} strokeWidth={2} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.ticketNum}>
            {formatTicket(pesagem.numero_ticket)}
          </Text>
          <StatusBadgeBala status={pesagem.status} />
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Pesos Grid */}
        <View style={styles.pesosGrid}>
          <View style={styles.pesoCard}>
            <Text style={styles.pesoLabel}>Bruto</Text>
            <Text style={styles.pesoValue}>
              {formatPeso(pesagem.peso_bruto_kg, true)}
            </Text>
          </View>
          <View style={styles.pesoCard}>
            <Text style={styles.pesoLabel}>Tara</Text>
            <Text style={styles.pesoValue}>
              {formatPeso(pesagem.peso_tara_kg, true)}
            </Text>
          </View>
          <View style={styles.pesoCard}>
            <Text style={styles.pesoLabel}>Liquido</Text>
            <Text style={styles.pesoValue}>
              {formatPeso(pesagem.peso_liquido_kg, true)}
            </Text>
          </View>
          <View style={[styles.pesoCard, styles.pesoCardFinal]}>
            <Text style={[styles.pesoLabel, { color: Colors.surface }]}>
              Peso Final
            </Text>
            <Text style={[styles.pesoValue, styles.pesoFinalValue]}>
              {formatPeso(
                pesagem.peso_final_kg ?? pesagem.peso_liquido_kg,
                true
              )}
            </Text>
          </View>
        </View>

        {/* Quality */}
        {(pesagem.umidade_pct != null || pesagem.impureza_pct != null) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Qualidade</Text>
            <View style={styles.qualityRow}>
              {pesagem.umidade_pct != null ? (
                <View style={styles.qualityChip}>
                  <Text style={styles.qualityLabel}>Umidade</Text>
                  <Text style={styles.qualityValue}>
                    {pesagem.umidade_pct.toFixed(1)}%
                  </Text>
                </View>
              ) : null}
              {pesagem.impureza_pct != null ? (
                <View style={styles.qualityChip}>
                  <Text style={styles.qualityLabel}>Impureza</Text>
                  <Text style={styles.qualityValue}>
                    {pesagem.impureza_pct.toFixed(1)}%
                  </Text>
                </View>
              ) : null}
              {pesagem.desconto_kg != null && pesagem.desconto_kg > 0 ? (
                <View style={styles.qualityChip}>
                  <Text style={styles.qualityLabel}>Desconto</Text>
                  <Text style={[styles.qualityValue, { color: Colors.warning }]}>
                    {formatPeso(pesagem.desconto_kg, true)}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informacoes</Text>
          <View style={styles.infoCard}>
            <InfoRow
              icon={Truck}
              label="Placa"
              value={pesagem.placa}
            />
            <InfoRow label="Motorista" value={pesagem.motorista_nome} />
            {pesagem.motorista_doc ? (
              <InfoRow label="CPF/Doc" value={pesagem.motorista_doc} />
            ) : null}
            <InfoRow label="Produto" value={pesagem.produto_nome} />
            <InfoRow
              label="Operacao"
              value={pesagem.tipo_operacao.toUpperCase()}
            />
            {pesagem.cliente_nome ? (
              <InfoRow label="Cliente" value={pesagem.cliente_nome} />
            ) : null}
            {pesagem.transportadora_nome ? (
              <InfoRow
                label="Transportadora"
                value={pesagem.transportadora_nome}
              />
            ) : null}
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timeline}>
            <TimelineItem
              icon={Calendar}
              label="Entrada"
              value={formatDateTimeBR(pesagem.entrada_em)}
              active
            />
            <TimelineItem
              icon={Clock}
              label="Peso bruto"
              value={formatDateTimeBR(pesagem.bruta_em)}
              active={!!pesagem.bruta_em}
            />
            <TimelineItem
              icon={Clock}
              label="Peso tara"
              value={formatDateTimeBR(pesagem.tara_em)}
              active={!!pesagem.tara_em}
            />
            <TimelineItem
              icon={Calendar}
              label="Saida"
              value={formatDateTimeBR(pesagem.saida_em)}
              active={!!pesagem.saida_em}
              isLast
            />
          </View>
        </View>

        {/* Photos */}
        {(pesagem.foto_entrada_url || pesagem.foto_saida_url) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos</Text>
            <View style={styles.photosRow}>
              {pesagem.foto_entrada_url ? (
                <View style={styles.photoWrap}>
                  <Image
                    source={{ uri: pesagem.foto_entrada_url }}
                    style={styles.photo}
                  />
                  <Text style={styles.photoLabel}>Entrada</Text>
                </View>
              ) : null}
              {pesagem.foto_saida_url ? (
                <View style={styles.photoWrap}>
                  <Image
                    source={{ uri: pesagem.foto_saida_url }}
                    style={styles.photo}
                  />
                  <Text style={styles.photoLabel}>Saida</Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Observacoes */}
        {pesagem.observacoes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observacoes</Text>
            <View style={styles.obsCard}>
              <Text style={styles.obsText}>{pesagem.observacoes}</Text>
            </View>
          </View>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          <PrimaryButton
            label="Compartilhar PDF"
            icon={Share2}
            onPress={handleSharePdf}
            loading={pdfLoading}
            size="lg"
            style={{ width: '100%' }}
          />
          <PrimaryButton
            label="Imprimir"
            icon={Printer}
            onPress={handlePrint}
            variant="secondary"
            size="md"
            style={{ width: '100%' }}
          />
          {canCancel ? (
            <PrimaryButton
              label="Cancelar Pesagem"
              icon={XCircle}
              onPress={handleCancel}
              variant="danger"
              size="md"
              style={{ width: '100%' }}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

// --- Sub-components ---

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Truck;
  label: string;
  value: string;
}) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <View style={infoStyles.valueWrap}>
        {Icon ? (
          <Icon size={14} color={Colors.primary} strokeWidth={1.5} />
        ) : null}
        <Text style={infoStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

function TimelineItem({
  icon: Icon,
  label,
  value,
  active,
  isLast,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  active: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={tlStyles.item}>
      <View style={tlStyles.dotCol}>
        <View
          style={[
            tlStyles.dot,
            active ? tlStyles.dotActive : tlStyles.dotInactive,
          ]}
        >
          <Icon
            size={12}
            color={active ? Colors.surface : Colors.muted}
            strokeWidth={2}
          />
        </View>
        {!isLast ? (
          <View
            style={[
              tlStyles.line,
              active ? tlStyles.lineActive : tlStyles.lineInactive,
            ]}
          />
        ) : null}
      </View>
      <View style={tlStyles.content}>
        <Text style={tlStyles.label}>{label}</Text>
        <Text style={[tlStyles.value, !active && tlStyles.valueInactive]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  emptyText: {
    fontFamily: Typography.heading,
    fontSize: 17,
    color: Colors.textMuted,
  },
  successToast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 60,
    left: Spacing.xl,
    right: Spacing.xl,
    backgroundColor: Colors.success,
    borderRadius: Radius.md,
    padding: Spacing.md,
    zIndex: 100,
    alignItems: 'center',
    ...Shadows.md,
  },
  successText: {
    fontFamily: Typography.bodySemibold,
    fontSize: 14,
    color: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerCenter: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  ticketNum: {
    fontFamily: Typography.display,
    fontSize: 20,
    color: Colors.accent,
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  // Pesos grid
  pesosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pesoCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  pesoCardFinal: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pesoLabel: {
    fontFamily: Typography.bodyMedium,
    fontSize: 11,
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pesoValue: {
    fontFamily: Typography.display,
    fontSize: 18,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  pesoFinalValue: {
    color: Colors.surface,
    fontSize: 20,
  },
  // Quality
  qualityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  qualityChip: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 2,
  },
  qualityLabel: {
    fontFamily: Typography.body,
    fontSize: 10,
    color: Colors.muted,
    textTransform: 'uppercase',
  },
  qualityValue: {
    fontFamily: Typography.bodySemibold,
    fontSize: 15,
    color: Colors.text,
  },
  // Section
  section: {
    gap: Spacing.sm,
  },
  // Timeline
  timeline: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontFamily: Typography.heading,
    fontSize: 13,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Info
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  // Photos
  photosRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  photoWrap: {
    flex: 1,
    gap: Spacing.xs,
  },
  photo: {
    width: '100%',
    height: 140,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
  },
  photoLabel: {
    fontFamily: Typography.body,
    fontSize: 11,
    color: Colors.muted,
    textAlign: 'center',
  },
  // Obs
  obsCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  obsText: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  // Actions
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
});

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: Colors.muted,
  },
  valueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  value: {
    fontFamily: Typography.bodySemibold,
    fontSize: 14,
    color: Colors.text,
  },
});

const tlStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dotCol: {
    alignItems: 'center',
    width: 28,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  lineActive: {
    backgroundColor: Colors.primary,
  },
  lineInactive: {
    backgroundColor: Colors.border,
  },
  content: {
    flex: 1,
    paddingBottom: Spacing.lg,
    gap: 2,
  },
  label: {
    fontFamily: Typography.bodyMedium,
    fontSize: 13,
    color: Colors.text,
  },
  value: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  valueInactive: {
    color: Colors.muted,
  },
});
