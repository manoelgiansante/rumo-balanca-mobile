import { Plus } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Colors, Radius, Shadows, Spacing, Typography } from '../../constants/theme';
import { useBalancaCadastroStore } from '../../stores/useBalancaCadastroStore';
import type { CadastroTable } from '../../types/database';

type Tab = {
  key: CadastroTable;
  label: string;
};

const TABS: Tab[] = [
  { key: 'bala_produto', label: 'Produtos' },
  { key: 'bala_placa', label: 'Placas' },
  { key: 'bala_motorista', label: 'Motoristas' },
  { key: 'bala_transportadora', label: 'Transportadoras' },
  { key: 'bala_cliente', label: 'Clientes' },
];

type FormField = {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'words' | 'characters' | 'sentences';
};

const FORM_FIELDS: Record<CadastroTable, FormField[]> = {
  bala_produto: [
    { key: 'nome', label: 'Nome do produto', placeholder: 'Ex: Soja', required: true, autoCapitalize: 'words' },
  ],
  bala_placa: [
    { key: 'placa', label: 'Placa', placeholder: 'ABC-1D23', required: true, autoCapitalize: 'characters' },
    { key: 'descricao', label: 'Descricao', placeholder: 'Ex: Carreta graneleira' },
  ],
  bala_motorista: [
    { key: 'nome', label: 'Nome', placeholder: 'Nome completo', required: true, autoCapitalize: 'words' },
    { key: 'cpf', label: 'CPF', placeholder: '000.000.000-00' },
    { key: 'phone', label: 'Telefone', placeholder: '(00) 0 0000-0000', keyboardType: 'phone-pad' },
  ],
  bala_transportadora: [
    { key: 'nome', label: 'Nome', placeholder: 'Nome da transportadora', required: true, autoCapitalize: 'words' },
    { key: 'cnpj', label: 'CNPJ', placeholder: '00.000.000/0000-00' },
    { key: 'phone', label: 'Telefone', placeholder: '(00) 0 0000-0000', keyboardType: 'phone-pad' },
  ],
  bala_cliente: [
    { key: 'nome', label: 'Nome', placeholder: 'Nome do cliente', required: true, autoCapitalize: 'words' },
    { key: 'cpf_cnpj', label: 'CPF/CNPJ', placeholder: 'CPF ou CNPJ' },
    { key: 'phone', label: 'Telefone', placeholder: '(00) 0 0000-0000', keyboardType: 'phone-pad' },
  ],
};

// Row name accessor per table type
function getRowName(table: CadastroTable, item: Record<string, unknown>): string {
  if (table === 'bala_placa') return String(item.placa ?? '');
  return String(item.nome ?? '');
}

function getRowSubtitle(table: CadastroTable, item: Record<string, unknown>): string | null {
  switch (table) {
    case 'bala_produto':
      return null;
    case 'bala_placa':
      return item.descricao ? String(item.descricao) : null;
    case 'bala_motorista':
      return item.cpf ? String(item.cpf) : null;
    case 'bala_transportadora':
      return item.cnpj ? String(item.cnpj) : null;
    case 'bala_cliente':
      return item.cpf_cnpj ? String(item.cpf_cnpj) : null;
  }
}

export default function CadastrosScreen() {
  const insets = useSafeAreaInsets();
  const store = useBalancaCadastroStore();
  const [activeTab, setActiveTab] = useState<CadastroTable>('bala_produto');
  const [modalVisible, setModalVisible] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    store.fetchAll();
  }, []);

  const data = useMemo(() => {
    switch (activeTab) {
      case 'bala_produto':
        return store.produtos;
      case 'bala_placa':
        return store.placas;
      case 'bala_motorista':
        return store.motoristas;
      case 'bala_transportadora':
        return store.transportadoras;
      case 'bala_cliente':
        return store.clientes;
    }
  }, [activeTab, store.produtos, store.placas, store.motoristas, store.transportadoras, store.clientes]);

  const isLoading = store.loading[activeTab];

  const openAddModal = useCallback(() => {
    setFormValues({});
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(async () => {
    const fields = FORM_FIELDS[activeTab];
    const required = fields.filter((f) => f.required);
    const missing = required.filter((f) => !formValues[f.key]?.trim());
    if (missing.length > 0) {
      Alert.alert('Campo obrigatorio', `Preencha: ${missing.map((f) => f.label).join(', ')}`);
      return;
    }
    setSaving(true);
    const payload: Record<string, string> = {};
    for (const field of fields) {
      const val = formValues[field.key]?.trim();
      if (val) payload[field.key] = val;
    }
    const ok = await store.create(activeTab, payload);
    setSaving(false);
    if (ok) {
      setModalVisible(false);
      setFormValues({});
    } else {
      Alert.alert('Erro', store.error ?? 'Falha ao salvar');
    }
  }, [activeTab, formValues, store]);

  const handleDeactivate = useCallback(
    (id: string, name: string) => {
      Alert.alert(
        'Desativar',
        `Deseja desativar "${name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desativar',
            style: 'destructive',
            onPress: () => store.remove(activeTab, id),
          },
        ]
      );
    },
    [activeTab, store]
  );

  const renderItem = useCallback(
    ({ item }: { item: Record<string, unknown> }) => {
      const name = getRowName(activeTab, item);
      const subtitle = getRowSubtitle(activeTab, item);
      return (
        <Pressable
          onLongPress={() => handleDeactivate(String(item.id), name)}
          style={styles.listItem}
          accessibilityRole="button"
          accessibilityLabel={name}
        >
          <View style={styles.listItemContent}>
            <Text style={styles.listItemName}>{name}</Text>
            {subtitle ? (
              <Text style={styles.listItemSub}>{subtitle}</Text>
            ) : null}
          </View>
        </Pressable>
      );
    },
    [activeTab, handleDeactivate]
  );

  const keyExtractor = useCallback(
    (item: Record<string, unknown>) => String(item.id),
    []
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cadastros</Text>
        <Pressable
          onPress={openAddModal}
          style={styles.addBtn}
          accessibilityRole="button"
          accessibilityLabel="Adicionar cadastro"
        >
          <Plus size={20} color={Colors.surface} strokeWidth={2} />
        </Pressable>
      </View>

      {/* Tab chips */}
      <FlatList
        data={TABS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(t) => t.key}
        contentContainerStyle={styles.tabRow}
        renderItem={({ item: tab }) => (
          <Pressable
            onPress={() => setActiveTab(tab.key)}
            style={[
              styles.tabChip,
              activeTab === tab.key && styles.tabChipActive,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.key }}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        )}
      />

      {/* List */}
      <FlatList
        data={data as unknown as Record<string, unknown>[]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        ItemSeparatorComponent={() => <View style={styles.listSep} />}
        ListEmptyComponent={
          <EmptyState
            title={isLoading ? 'Carregando...' : 'Nenhum cadastro'}
            description={
              isLoading
                ? undefined
                : 'Toque em + para adicionar o primeiro registro.'
            }
          />
        }
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
      />

      {/* Add Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </Pressable>
            <Text style={styles.modalTitle}>
              {TABS.find((t) => t.key === activeTab)?.label ?? 'Novo'}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.modalBody}
            keyboardShouldPersistTaps="handled"
          >
            {FORM_FIELDS[activeTab].map((field) => (
              <View key={field.key} style={styles.modalField}>
                <Text style={styles.modalLabel}>
                  {field.label}
                  {field.required ? ' *' : ''}
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder={field.placeholder}
                  placeholderTextColor={Colors.muted}
                  value={formValues[field.key] ?? ''}
                  onChangeText={(v) =>
                    setFormValues((prev) => ({ ...prev, [field.key]: v }))
                  }
                  keyboardType={field.keyboardType ?? 'default'}
                  autoCapitalize={field.autoCapitalize ?? 'sentences'}
                />
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <PrimaryButton
              label="Salvar"
              onPress={handleSave}
              loading={saving}
              size="lg"
              style={{ width: '100%' }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  headerTitle: {
    fontFamily: Typography.display,
    fontSize: 24,
    color: Colors.text,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  tabChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabLabel: {
    fontFamily: Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.surface,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  listSep: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 1,
  },
  listItem: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  listItemContent: {
    gap: 2,
  },
  listItemName: {
    fontFamily: Typography.bodySemibold,
    fontSize: 15,
    color: Colors.text,
  },
  listItemSub: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.textMuted,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCancel: {
    fontFamily: Typography.bodyMedium,
    fontSize: 15,
    color: Colors.primary,
  },
  modalTitle: {
    fontFamily: Typography.heading,
    fontSize: 17,
    color: Colors.text,
  },
  modalBody: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  modalField: {
    gap: Spacing.xs,
  },
  modalLabel: {
    fontFamily: Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  modalInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: Typography.body,
    fontSize: 15,
    color: Colors.text,
  },
  modalFooter: {
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
