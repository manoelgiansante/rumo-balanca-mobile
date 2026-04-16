import { useRouter } from 'expo-router';
import { Plus, Scale } from 'lucide-react-native';
import { useCallback, useEffect, useMemo } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { KpiBala } from '../../components/KpiBala';
import { PesagemCard } from '../../components/PesagemCard';
import { PesagemCardSkeleton } from '../../components/Skeleton';
import { Colors, Radius, Shadows, Spacing, Typography } from '../../constants/theme';
import { useBalancaPesagemStore } from '../../stores/useBalancaPesagemStore';
import type { BalaPesagem } from '../../types/database';
import { formatDateBR, formatPeso, getGreeting } from '../../utils/format';

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { pesagens, loading, fetchAll } = useBalancaPesagemStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const pesagensHoje = useMemo(
    () =>
      pesagens.filter(
        (p) =>
          typeof p.created_at === 'string' && p.created_at.startsWith(today)
      ),
    [pesagens, today]
  );

  const ticketsHoje = pesagensHoje.filter(
    (p) => p.status === 'concluida'
  ).length;

  const pesoTotalHoje = useMemo(
    () =>
      pesagensHoje.reduce(
        (acc, p) => acc + (p.peso_final_kg ?? p.peso_liquido_kg ?? 0),
        0
      ),
    [pesagensHoje]
  );

  const aguardando = pesagens.filter(
    (p) => p.status === 'aguardando' || p.status === 'pesagem_bruta'
  ).length;

  const onRefresh = useCallback(() => {
    fetchAll();
  }, [fetchAll]);

  const renderItem = useCallback(
    ({ item }: { item: BalaPesagem }) => <PesagemCard pesagem={item} />,
    []
  );

  const keyExtractor = useCallback((item: BalaPesagem) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.headerTitle}>Rumo Balanca</Text>
          </View>
          <Text style={styles.date}>{formatDateBR(new Date())}</Text>
        </View>

        {/* KPIs */}
        <View style={styles.kpiRow}>
          <KpiBala
            label="TICKETS HOJE"
            value={ticketsHoje}
            tone="positive"
          />
          <KpiBala
            label="PESO TOTAL"
            value={formatPeso(pesoTotalHoje)}
            tone="neutral"
          />
          <KpiBala
            label="AGUARDANDO"
            value={aguardando}
            tone={aguardando > 0 ? 'warning' : 'neutral'}
          />
        </View>

        {/* Section title */}
        <Text style={styles.sectionTitle}>Pesagens de hoje</Text>
      </View>
    ),
    [insets.top, ticketsHoje, pesoTotalHoje, aguardando]
  );

  const ListEmpty = useMemo(
    () =>
      loading ? (
        <View style={styles.skeletons}>
          <PesagemCardSkeleton />
          <PesagemCardSkeleton />
          <PesagemCardSkeleton />
        </View>
      ) : (
        <EmptyState
          icon={Scale}
          title="Nenhuma pesagem hoje"
          description="Toque no botao + para registrar a primeira pesagem do dia."
        />
      ),
    [loading]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pesagensHoje}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/pesagem/nova')}
        style={({ pressed }) => [
          styles.fab,
          {
            bottom:
              Platform.OS === 'ios'
                ? insets.bottom + 96
                : 72,
          },
          pressed && styles.fabPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Nova pesagem"
      >
        <Plus size={28} color={Colors.surface} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  listHeader: {
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: Colors.primary,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  greeting: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: Typography.display,
    fontSize: 24,
    color: Colors.surface,
    letterSpacing: 0.5,
  },
  date: {
    fontFamily: Typography.bodyMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.heading,
    fontSize: 15,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  separator: {
    height: Spacing.sm,
  },
  skeletons: {
    gap: Spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});
