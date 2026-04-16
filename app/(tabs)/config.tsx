import { LogOut } from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

const APP_VERSION = '1.0.0';

export default function ConfigScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuracoes</Text>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
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
    marginTop: 'auto',
    paddingBottom: Spacing.xxl,
    lineHeight: 18,
  },
});
