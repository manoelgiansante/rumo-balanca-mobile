import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
} from 'lucide-react-native';
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
import { PrimaryButton } from '../../components/PrimaryButton';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { useBalancaCadastroStore } from '../../stores/useBalancaCadastroStore';
import { useBalancaPesagemStore } from '../../stores/useBalancaPesagemStore';
import type { TipoOperacao } from '../../types/database';
import { calcularLiquido, formatPeso, parsePeso } from '../../utils/format';

const TOTAL_STEPS = 4;

export default function NovaPesagemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pesagemStore = useBalancaPesagemStore();
  const cadastroStore = useBalancaCadastroStore();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [pesagemId, setPesagemId] = useState<string | null>(null);

  // Step 1 — Identification
  const [tipoOperacao, setTipoOperacao] = useState<TipoOperacao>('entrada');
  const [produtoNome, setProdutoNome] = useState('');
  const [produtoId, setProdutoId] = useState<string | null>(null);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [transportadoraNome, setTransportadoraNome] = useState('');
  const [transportadoraId, setTransportadoraId] = useState<string | null>(null);

  // Step 2 — Driver & Plate
  const [placa, setPlaca] = useState('');
  const [motoristaNome, setMotoristaNome] = useState('');
  const [motoristaCpf, setMotoristaCpf] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Step 3 — Peso Bruto
  const [pesoBrutoStr, setPesoBrutoStr] = useState('');

  // Step 4 — Tara & Quality
  const [pesoTaraStr, setPesoTaraStr] = useState('');
  const [umidadeStr, setUmidadeStr] = useState('');
  const [impurezaStr, setImpurezaStr] = useState('');

  // Autocomplete modals
  const [pickerVisible, setPickerVisible] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    cadastroStore.fetchAll();
  }, []);

  // Calculated values for step 4
  const pesoBrutoKg = parsePeso(pesoBrutoStr);
  const pesoTaraKg = parsePeso(pesoTaraStr);
  const umidadePct = umidadeStr ? parseFloat(umidadeStr.replace(',', '.')) : null;
  const impurezaPct = impurezaStr ? parseFloat(impurezaStr.replace(',', '.')) : null;

  const calcResult = useMemo(() => {
    if (pesoBrutoKg == null || pesoTaraKg == null) return null;
    return calcularLiquido(pesoBrutoKg, pesoTaraKg, umidadePct, impurezaPct, 14);
  }, [pesoBrutoKg, pesoTaraKg, umidadePct, impurezaPct]);

  // --- Autocomplete data ---
  const produtosList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return cadastroStore.produtos.filter((p) =>
      p.nome.toLowerCase().includes(q)
    );
  }, [cadastroStore.produtos, searchQuery]);

  const motoristasList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return cadastroStore.motoristas.filter((m) =>
      m.nome.toLowerCase().includes(q)
    );
  }, [cadastroStore.motoristas, searchQuery]);

  const clientesList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return cadastroStore.clientes.filter((c) =>
      c.nome.toLowerCase().includes(q)
    );
  }, [cadastroStore.clientes, searchQuery]);

  const transportadorasList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return cadastroStore.transportadoras.filter((t) =>
      t.nome.toLowerCase().includes(q)
    );
  }, [cadastroStore.transportadoras, searchQuery]);

  // --- Step navigation ---
  const canAdvance = useMemo(() => {
    switch (step) {
      case 1:
        return produtoNome.trim().length > 0;
      case 2:
        return placa.trim().length >= 7 && motoristaNome.trim().length > 0;
      case 3:
        return pesoBrutoKg != null && pesoBrutoKg > 0;
      case 4:
        return pesoTaraKg != null && pesoTaraKg > 0;
      default:
        return false;
    }
  }, [step, produtoNome, placa, motoristaNome, pesoBrutoKg, pesoTaraKg]);

  const handleNext = useCallback(async () => {
    if (!canAdvance) return;

    if (step === 2) {
      // Create pesagem after step 2
      setSaving(true);
      try {
        const result = await pesagemStore.criarPesagem({
          tipo_operacao: tipoOperacao,
          placa: placa.trim().toUpperCase(),
          motorista_nome: motoristaNome.trim(),
          motorista_doc: motoristaCpf.trim() || null,
          produto_id: produtoId,
          produto_nome: produtoNome.trim(),
          cliente_id: clienteId,
          cliente_nome: clienteNome.trim() || null,
          transportadora_id: transportadoraId,
          transportadora_nome: transportadoraNome.trim() || null,
          observacoes: observacoes.trim() || null,
        });
        if (result) {
          setPesagemId(result.id);
          setStep(3);
        } else {
          Alert.alert('Erro', pesagemStore.error ?? 'Falha ao criar pesagem');
        }
      } catch {
        Alert.alert('Erro', 'Falha ao conectar');
      } finally {
        setSaving(false);
      }
      return;
    }

    if (step === 3 && pesagemId && pesoBrutoKg) {
      // Register bruto
      setSaving(true);
      try {
        const result = await pesagemStore.registrarBruto(pesagemId, pesoBrutoKg);
        if (result) {
          setStep(4);
        } else {
          Alert.alert('Erro', pesagemStore.error ?? 'Falha ao registrar peso bruto');
        }
      } catch {
        Alert.alert('Erro', 'Falha ao conectar');
      } finally {
        setSaving(false);
      }
      return;
    }

    if (step === 4 && pesagemId && pesoTaraKg) {
      // Register tara + conclude
      setSaving(true);
      try {
        const taraResult = await pesagemStore.registrarTara(pesagemId, {
          peso_tara_kg: pesoTaraKg,
          umidade_pct: umidadePct,
          impureza_pct: impurezaPct,
          umidade_base: 14,
        });
        if (!taraResult) {
          Alert.alert('Erro', pesagemStore.error ?? 'Falha ao registrar tara');
          setSaving(false);
          return;
        }
        const concResult = await pesagemStore.concluir(pesagemId);
        if (concResult) {
          router.replace({
            pathname: '/pesagem/[id]',
            params: { id: pesagemId, success: 'true' },
          });
        } else {
          Alert.alert('Erro', pesagemStore.error ?? 'Falha ao concluir');
        }
      } catch {
        Alert.alert('Erro', 'Falha ao conectar');
      } finally {
        setSaving(false);
      }
      return;
    }

    // Default: just advance step
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, [
    step,
    canAdvance,
    pesagemStore,
    tipoOperacao,
    placa,
    motoristaNome,
    motoristaCpf,
    produtoId,
    produtoNome,
    clienteId,
    clienteNome,
    transportadoraId,
    transportadoraNome,
    observacoes,
    pesagemId,
    pesoBrutoKg,
    pesoTaraKg,
    umidadePct,
    impurezaPct,
    router,
  ]);

  const handleBack = useCallback(() => {
    if (step === 1) {
      router.back();
    } else {
      setStep((s) => s - 1);
    }
  }, [step, router]);

  const handlePickPhoto = useCallback(async () => {
    if (!pesagemId) return;
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets[0]) {
        await pesagemStore.anexarFoto(
          pesagemId,
          'foto_entrada_url',
          result.assets[0].uri
        );
      }
    } catch {
      // Camera not available or permission denied
    }
  }, [pesagemId, pesagemStore]);

  // --- Render Steps ---
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Identificacao</Text>
      <Text style={styles.stepDesc}>O que esta sendo pesado?</Text>

      {/* Tipo Operacao Toggle */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>TIPO DE OPERACAO</Text>
        <View style={styles.toggleRow}>
          <Pressable
            onPress={() => setTipoOperacao('entrada')}
            style={[
              styles.toggleBtn,
              tipoOperacao === 'entrada' && styles.toggleBtnActive,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: tipoOperacao === 'entrada' }}
          >
            <Text
              style={[
                styles.toggleText,
                tipoOperacao === 'entrada' && styles.toggleTextActive,
              ]}
            >
              ENTRADA
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTipoOperacao('saida')}
            style={[
              styles.toggleBtn,
              tipoOperacao === 'saida' && styles.toggleBtnActive,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: tipoOperacao === 'saida' }}
          >
            <Text
              style={[
                styles.toggleText,
                tipoOperacao === 'saida' && styles.toggleTextActive,
              ]}
            >
              SAIDA
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Produto */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>PRODUTO *</Text>
        <Pressable
          onPress={() => {
            setSearchQuery('');
            setPickerVisible('produto');
          }}
          style={styles.pickerBtn}
        >
          <Text
            style={[
              styles.pickerText,
              !produtoNome && styles.pickerPlaceholder,
            ]}
          >
            {produtoNome || 'Selecione ou digite o produto'}
          </Text>
          <ChevronDown size={18} color={Colors.muted} />
        </Pressable>
      </View>

      {/* Cliente */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>CLIENTE (OPCIONAL)</Text>
        <Pressable
          onPress={() => {
            setSearchQuery('');
            setPickerVisible('cliente');
          }}
          style={styles.pickerBtn}
        >
          <Text
            style={[
              styles.pickerText,
              !clienteNome && styles.pickerPlaceholder,
            ]}
          >
            {clienteNome || 'Selecione o cliente'}
          </Text>
          <ChevronDown size={18} color={Colors.muted} />
        </Pressable>
      </View>

      {/* Transportadora */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>TRANSPORTADORA (OPCIONAL)</Text>
        <Pressable
          onPress={() => {
            setSearchQuery('');
            setPickerVisible('transportadora');
          }}
          style={styles.pickerBtn}
        >
          <Text
            style={[
              styles.pickerText,
              !transportadoraNome && styles.pickerPlaceholder,
            ]}
          >
            {transportadoraNome || 'Selecione a transportadora'}
          </Text>
          <ChevronDown size={18} color={Colors.muted} />
        </Pressable>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Motorista & Placa</Text>
      <Text style={styles.stepDesc}>Dados do veiculo e motorista</Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>PLACA *</Text>
        <TextInput
          style={styles.textInput}
          value={placa}
          onChangeText={(v) => setPlaca(v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7))}
          placeholder="ABC1D23"
          placeholderTextColor={Colors.muted}
          autoCapitalize="characters"
          maxLength={7}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>MOTORISTA *</Text>
        <Pressable
          onPress={() => {
            setSearchQuery('');
            setPickerVisible('motorista');
          }}
          style={styles.pickerBtn}
        >
          <Text
            style={[
              styles.pickerText,
              !motoristaNome && styles.pickerPlaceholder,
            ]}
          >
            {motoristaNome || 'Selecione ou digite o motorista'}
          </Text>
          <ChevronDown size={18} color={Colors.muted} />
        </Pressable>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>CPF (OPCIONAL)</Text>
        <TextInput
          style={styles.textInput}
          value={motoristaCpf}
          onChangeText={setMotoristaCpf}
          placeholder="000.000.000-00"
          placeholderTextColor={Colors.muted}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>OBSERVACOES (OPCIONAL)</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={observacoes}
          onChangeText={setObservacoes}
          placeholder="Notas sobre a carga..."
          placeholderTextColor={Colors.muted}
          multiline
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Peso Bruto</Text>
      <Text style={styles.stepDesc}>Registre o peso do caminhao carregado</Text>

      <View style={styles.bigInputWrap}>
        <TextInput
          style={styles.bigInput}
          value={pesoBrutoStr}
          onChangeText={setPesoBrutoStr}
          placeholder="0"
          placeholderTextColor={Colors.border}
          keyboardType="numeric"
          autoFocus
        />
        <Text style={styles.bigInputUnit}>kg</Text>
      </View>

      {pesoBrutoKg != null && pesoBrutoKg > 0 ? (
        <Text style={styles.pesoPreview}>{formatPeso(pesoBrutoKg)}</Text>
      ) : null}

      <Pressable
        onPress={handlePickPhoto}
        style={styles.photoBtn}
        accessibilityRole="button"
        accessibilityLabel="Tirar foto do caminhao"
      >
        <Camera size={20} color={Colors.primary} strokeWidth={1.75} />
        <Text style={styles.photoBtnText}>Foto de entrada</Text>
      </Pressable>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Tara & Qualidade</Text>
      <Text style={styles.stepDesc}>Peso do caminhao vazio e classificacao</Text>

      <View style={styles.bigInputWrap}>
        <TextInput
          style={styles.bigInput}
          value={pesoTaraStr}
          onChangeText={setPesoTaraStr}
          placeholder="0"
          placeholderTextColor={Colors.border}
          keyboardType="numeric"
          autoFocus
        />
        <Text style={styles.bigInputUnit}>kg</Text>
      </View>

      {/* Quality */}
      <View style={styles.qualityRow}>
        <View style={styles.qualityField}>
          <Text style={styles.fieldLabel}>UMIDADE %</Text>
          <TextInput
            style={styles.textInput}
            value={umidadeStr}
            onChangeText={setUmidadeStr}
            placeholder="14.0"
            placeholderTextColor={Colors.muted}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.qualityField}>
          <Text style={styles.fieldLabel}>IMPUREZA %</Text>
          <TextInput
            style={styles.textInput}
            value={impurezaStr}
            onChangeText={setImpurezaStr}
            placeholder="0.0"
            placeholderTextColor={Colors.muted}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Calculated values */}
      {calcResult ? (
        <View style={styles.calcCard}>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Liquido</Text>
            <Text style={styles.calcValue}>{formatPeso(calcResult.liquido)}</Text>
          </View>
          {calcResult.desconto > 0 ? (
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Desconto</Text>
              <Text style={[styles.calcValue, { color: Colors.warning }]}>
                - {formatPeso(calcResult.desconto)}
              </Text>
            </View>
          ) : null}
          <View style={[styles.calcRow, styles.calcFinal]}>
            <Text style={styles.calcFinalLabel}>PESO FINAL</Text>
            <Text style={styles.calcFinalValue}>
              {formatPeso(calcResult.final)}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );

  // --- Picker Modal ---
  const getPickerData = () => {
    switch (pickerVisible) {
      case 'produto':
        return produtosList.map((p) => ({ id: p.id, name: p.nome }));
      case 'motorista':
        return motoristasList.map((m) => ({ id: m.id, name: m.nome }));
      case 'cliente':
        return clientesList.map((c) => ({ id: c.id, name: c.nome }));
      case 'transportadora':
        return transportadorasList.map((t) => ({ id: t.id, name: t.nome }));
      default:
        return [];
    }
  };

  const handlePickerSelect = (id: string, name: string) => {
    switch (pickerVisible) {
      case 'produto':
        setProdutoId(id);
        setProdutoNome(name);
        break;
      case 'motorista':
        setMotoristaNome(name);
        break;
      case 'cliente':
        setClienteId(id);
        setClienteNome(name);
        break;
      case 'transportadora':
        setTransportadoraId(id);
        setTransportadoraNome(name);
        break;
    }
    setPickerVisible(null);
    setSearchQuery('');
  };

  const handlePickerManual = () => {
    const text = searchQuery.trim();
    if (!text) return;
    switch (pickerVisible) {
      case 'produto':
        setProdutoId(null);
        setProdutoNome(text);
        break;
      case 'motorista':
        setMotoristaNome(text);
        break;
      case 'cliente':
        setClienteId(null);
        setClienteNome(text);
        break;
      case 'transportadora':
        setTransportadoraId(null);
        setTransportadoraNome(text);
        break;
    }
    setPickerVisible(null);
    setSearchQuery('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={handleBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <ArrowLeft size={20} color={Colors.text} strokeWidth={2} />
        </Pressable>
        <Text style={styles.topTitle}>Nova Pesagem</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressRow}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              i < step && styles.progressDotFilled,
              i === step - 1 && styles.progressDotCurrent,
            ]}
          />
        ))}
      </View>
      <Text style={styles.progressText}>
        Passo {step} de {TOTAL_STEPS}
      </Text>

      {/* Step content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </ScrollView>

        {/* Bottom action */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <PrimaryButton
            label={
              step === 2
                ? 'Criar Pesagem'
                : step === 3
                ? 'Registrar Bruto'
                : step === 4
                ? 'Concluir Pesagem'
                : 'Proximo'
            }
            icon={step < 4 ? ArrowRight : Check}
            onPress={handleNext}
            loading={saving}
            disabled={!canAdvance}
            size="lg"
            style={{ width: '100%' }}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Autocomplete Picker Modal */}
      <Modal
        visible={pickerVisible !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setPickerVisible(null);
          setSearchQuery('');
        }}
      >
        <View style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <Pressable
              onPress={() => {
                setPickerVisible(null);
                setSearchQuery('');
              }}
            >
              <Text style={styles.pickerCancel}>Cancelar</Text>
            </Pressable>
            <Text style={styles.pickerTitle}>
              {pickerVisible === 'produto'
                ? 'Produto'
                : pickerVisible === 'motorista'
                ? 'Motorista'
                : pickerVisible === 'cliente'
                ? 'Cliente'
                : 'Transportadora'}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.pickerSearchWrap}>
            <TextInput
              style={styles.pickerSearch}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar ou digitar..."
              placeholderTextColor={Colors.muted}
              autoCapitalize="words"
              autoFocus
            />
          </View>

          <FlatList
            data={getPickerData()}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handlePickerSelect(item.id, item.name)}
                style={styles.pickerItem}
              >
                <Text style={styles.pickerItemText}>{item.name}</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.pickerEmpty}>
                <Text style={styles.pickerEmptyText}>
                  Nenhum resultado encontrado
                </Text>
              </View>
            }
            contentContainerStyle={styles.pickerList}
          />

          {searchQuery.trim().length > 0 ? (
            <View style={styles.pickerFooter}>
              <PrimaryButton
                label={`Usar "${searchQuery.trim()}"`}
                onPress={handlePickerManual}
                variant="secondary"
                size="md"
                style={{ width: '100%' }}
              />
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  flex: { flex: 1 },
  topBar: {
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
  topTitle: {
    fontFamily: Typography.heading,
    fontSize: 17,
    color: Colors.text,
  },
  progressRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  progressDotFilled: {
    backgroundColor: Colors.primary,
  },
  progressDotCurrent: {
    backgroundColor: Colors.accent,
  },
  progressText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 11,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  stepContent: {
    gap: Spacing.lg,
  },
  stepTitle: {
    fontFamily: Typography.display,
    fontSize: 22,
    color: Colors.text,
  },
  stepDesc: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: -Spacing.sm,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    fontFamily: Typography.bodyMedium,
    fontSize: 11,
    color: Colors.muted,
    letterSpacing: 0.8,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  toggleBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontFamily: Typography.bodySemibold,
    fontSize: 13,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  toggleTextActive: {
    color: Colors.surface,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  pickerText: {
    fontFamily: Typography.body,
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  pickerPlaceholder: {
    color: Colors.muted,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontFamily: Typography.body,
    fontSize: 15,
    color: Colors.text,
    minHeight: 48,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bigInputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.xl,
  },
  bigInput: {
    fontFamily: Typography.display,
    fontSize: 56,
    color: Colors.primary,
    textAlign: 'center',
    minWidth: 180,
    fontVariant: ['tabular-nums'],
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  bigInputUnit: {
    fontFamily: Typography.bodyMedium,
    fontSize: 20,
    color: Colors.muted,
    paddingBottom: Spacing.lg,
  },
  pesoPreview: {
    fontFamily: Typography.bodyMedium,
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: -Spacing.md,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
    borderStyle: 'dashed',
  },
  photoBtnText: {
    fontFamily: Typography.bodyMedium,
    fontSize: 14,
    color: Colors.primary,
  },
  qualityRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  qualityField: {
    flex: 1,
    gap: Spacing.xs,
  },
  calcCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabel: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.textMuted,
  },
  calcValue: {
    fontFamily: Typography.bodySemibold,
    fontSize: 15,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  calcFinal: {
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  calcFinalLabel: {
    fontFamily: Typography.heading,
    fontSize: 14,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  calcFinalValue: {
    fontFamily: Typography.display,
    fontSize: 20,
    color: Colors.primary,
    fontVariant: ['tabular-nums'],
  },
  bottomBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  // Picker modal
  pickerModal: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerCancel: {
    fontFamily: Typography.bodyMedium,
    fontSize: 15,
    color: Colors.primary,
  },
  pickerTitle: {
    fontFamily: Typography.heading,
    fontSize: 17,
    color: Colors.text,
  },
  pickerSearchWrap: {
    padding: Spacing.lg,
  },
  pickerSearch: {
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
  pickerList: {
    paddingHorizontal: Spacing.lg,
  },
  pickerItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerItemText: {
    fontFamily: Typography.body,
    fontSize: 15,
    color: Colors.text,
  },
  pickerEmpty: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  pickerEmptyText: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.muted,
  },
  pickerFooter: {
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
