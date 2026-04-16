import { useRouter } from 'expo-router';
import { Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Preencha email e senha.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await signIn(email.trim(), password);
      if (result.error) {
        setError(result.error);
      }
    } catch {
      setError('Erro ao conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>RB</Text>
            </View>
            <Text style={styles.title}>Rumo Balanca</Text>
            <Text style={styles.subtitle}>Controle de pesagens inteligente</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <View style={styles.inputWrap}>
                <Mail size={18} color={Colors.accentSoft} strokeWidth={1.5} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.inputWrap}>
                <Lock size={18} color={Colors.accentSoft} strokeWidth={1.5} />
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Entrar"
            >
              {loading ? (
                <ActivityIndicator color={Colors.primary} size="small" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push('/auth/signup')}
              style={styles.linkBtn}
              accessibilityRole="link"
            >
              <Text style={styles.linkText}>
                Nao tem conta?{' '}
                <Text style={styles.linkBold}>Criar conta</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  logoText: {
    fontFamily: Typography.display,
    fontSize: 28,
    color: '#c6ff5e',
    letterSpacing: 2,
  },
  title: {
    fontFamily: Typography.display,
    fontSize: 28,
    color: Colors.surface,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: Spacing.xs,
  },
  form: {
    gap: Spacing.lg,
  },
  field: {
    gap: Spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  input: {
    flex: 1,
    fontFamily: Typography.body,
    fontSize: 15,
    color: Colors.surface,
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
  },
  error: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: '#ff6b6b',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#c6ff5e',
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    fontFamily: Typography.bodySemibold,
    fontSize: 16,
    color: Colors.primary,
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  linkText: {
    fontFamily: Typography.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  linkBold: {
    fontFamily: Typography.bodySemibold,
    color: '#c6ff5e',
  },
});
