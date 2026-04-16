import AsyncStorage from '@react-native-async-storage/async-storage';
import { Check, LogOut, Pencil } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { EMPRESA_KEYS } from '../../lib/empresa-config';

const APP_VERSION = '1.0.0';

type EmpresaField = 'nome' | 'cnpj' | 'endereco';

function formatCNPJ(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export default function ConfigScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  // ── Empresa fields ──
  const [empresaNome, setEmpresaNome] = useState('');
  const [empresaCnpj, setEmpresaCnpj] = useState('');
  const [empresaEndereco, setEmpresaEndereco] = useState('');
  const [editing, setEditing] = useState<EmpresaField | null>(null);
  const inputRefs = useRef<Record<EmpresaField, TextInput | null>>({
    nome: null,
    cnpj: null,
    endereco: null,
  });

  useEffect(() => {
    (async () => {
      const [[, nome], [, cnpj], [, endereco]] = await AsyncStorage.multiGet([
        EMPRESA_KEYS.nome,
        EMPRESA_KEYS.cnpj,
        EMPRESA_KEYS.endereco,
      ]);
      if (nome) setEmpresaNome(nome);
      if (cnpj) setEmpresaCnpj(cnpj);
      if (endereco) setEmpresaEndereco(endereco);
    })();
  }, []);

  const saveField = async (field: EmpresaField) => {
    const keyMap: Record<EmpresaField, string> = {
      nome: EMPRESA_KEYS.nome,
      cnpj: EMPRESA_KEYS.cnpj,
      endereco: EMPRESA_KEYS.endereco,
    };
    const valueMap: Record<EmpresaField, string> = {
      nome: empresaNome,
      cnpj: empresaCnpj,
      endereco: empresaEndereco,
    };
    const value = valueMap[field].trim();
    if (value) {
      await AsyncStorage.setItem(keyMap[field], value);
    } else {
      await AsyncStorage.removeItem(keyMap[field]);
    }
    setEditing(null);
  };

  const startEditing = (field: EmpresaField) => {
    setEditing(field);
    setTimeout(() => inputRefs.current[field]?.focus(), 100);
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

  const renderEmpresaField = (
    field: EmpresaField,
    label: string,
    value: string,
    setValue: (v: string) => void,
    placeholder: string,
    isCnpj?: boolean
  ) => {
    const isEditing = editing === field;
    return (
      <View style={styles.editableRow} key={field}>
        <View style={styles.editableContent}>
          <Text style={styles.rowLabel}>{label}</Text>
          {isEditing ? (
            <TextInput
              ref={(ref) => {
                inputRefs.current[field] = ref;
              }}
              style={styles.editableInput}
              value={value}
              onChangeText={(text) =>
                isCnpj ? setValue(formatCNPJ(text)) : setValue(text)
              }
              onBlur={() => saveField(field)}
              onSubmitEditing={() => saveField(field)}
              placeholder={placeholder}
              placeholderTextColor={Colors.muted}
              returnKeyType="done"
              autoCapitalize={isCnpj ? 'none' : 'words'}
              keyboardType={isCnpj ? 'numeric' : 'default'}
            />
          ) : (
            <Text
              style={[styles.rowValue, !value && styles.rowPlaceholder]}
              numberOfLines={1}
            >
              {value || placeholder}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => (isEditing ? saveField(field) : startEditing(field))}
          style={styles.editBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={isEditing ? `Salvar ${label}` : `Editar ${label}`}
          accessibilityRole="button"
        >
          {isEditing ? (
            <Check size={16} color={Colors.success} />
          ) : (
            <Pencil size={14} color={Colors.muted} />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuracoes</Text>
      </View>

      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTA</Text>
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.email ?? 'U')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.email}>{user?.email ?? 'Sem email'}</Text>
              <Text style={styles.userId}>
                ID: {user?.id?.slice(0, 8) ?? '---'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APP</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Versao</Text>
            <Text style={styles.rowValue}>{APP_VERSION}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Build</Text>
            <Text style={styles.rowValue}>Expo 55</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EMPRESA</Text>
          <Text style={styles.sectionHint}>
            Dados exibidos no cabecalho do ticket PDF
          </Text>
          {renderEmpresaField(
            'nome',
            'Nome da Empresa',
            empresaNome,
            setEmpresaNome,
            'Ex: Fazenda Sao Jose'
          )}
          {renderEmpresaField(
            'cnpj',
            'CNPJ',
            empresaCnpj,
            setEmpresaCnpj,
            '00.000.000/0000-00',
            true
          )}
          {renderEmpresaField(
            'endereco',
            'Endereco',
            empresaEndereco,
            setEmpresaEndereco,
            'Rua, cidade - UF'
          )}
        </View>

        <View style={styles.logoutSection}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutBtn,
              pressed && styles.logoutPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
          >
            <LogOut size={18} color={Colors.error} strokeWidth={1.75} />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>
          Rumo Balanca v{APP_VERSION} {'\n'}
          AgroRumo Tecnologia
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  headerTitle: {
    fontFamily: Typography.display,
    fontSize: 24,
    color: Colors.text,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Typography.bodyMedium,
    fontSize: 11,
    color: Colors.muted,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Typography.display,
    fontSize: 18,
    color: Colors.surface,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  email: {
    fontFamily: Typography.bodySemibold,
    fontSize: 15,
    color: Colors.text,
  },
  userId: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.muted,
    fontVariant: ['tabular-nums'],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  rowLabel: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: Colors.textMuted,
  },
  rowValue: {
    fontFamily: Typography.bodyMedium,
    fontSize: 14,
    color: Colors.text,
  },
  sectionHint: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.muted,
    marginBottom: Spacing.md,
  },
  editableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  editableContent: {
    flex: 1,
    gap: 2,
  },
  editableInput: {
    fontFamily: Typography.bodyMedium,
    fontSize: 14,
    color: Colors.text,
    padding: 0,
    margin: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingBottom: 2,
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowPlaceholder: {
    color: Colors.muted,
    fontStyle: 'italic',
  },
  logoutSection: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.errorSoft,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutPressed: {
    opacity: 0.7,
  },
  logoutText: {
    fontFamily: Typography.bodySemibold,
    fontSize: 15,
    color: Colors.error,
  },
  footer: {
    fontFamily: Typography.body,
    fontSize: 11,
    color: Colors.muted,
    textAlign: 'center',
    marginTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    lineHeight: 18,
  },
});
