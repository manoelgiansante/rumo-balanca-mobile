import { useRouter } from 'expo-router';
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

export default function SignupScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Preencha email e senha.');
      return;
    }
    if (password.length < 6) {
      setError('Senha deve ter no minimo 6 caracteres.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await signUp(email.trim(), password);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Erro ao conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.successWrap}>
          <Text style={styles.successIcon}>✉</Text>
          <Text style={styles.successTitle}>Confira seu email</Text>
          <Text style={styles.successDesc}>
            Enviamos um link de confirmacao para {email}. Abra o email e clique
            no link para ativar sua conta.
          </Text>
          <Pressable
            onPress={() => router.replace('/auth/login')}
            style={styles.button}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Voltar ao login</Text>
          </Pressable>
        </View>
      </View>
    );
  }

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
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>
              Comece a controlar suas pesagens agora
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrap}>
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

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Senha (min. 6 caracteres)"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleSignup}
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={handleSignup}
              disabled={loading}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Criar conta"
            >
              {loading ? (
                <ActivityIndicator color={Colors.primary} size="small" />
              ) : (
                <Text style={styles.buttonText}>Criar conta</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              style={styles.linkBtn}
              accessibilityRole="link"
            >
              <Text style={styles.linkText}>
                Ja tem conta?{' '}
                <Text style={styles.linkBold}>Entrar</Text>
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
  inputWrap: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: Spacing.lg,
  },
  input: {
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
  successWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  successIcon: {
    fontSize: 48,
  },
  successTitle: {
    fontFamily: Typography.display,
    fontSize: 24,
    color: Colors.surface,
  },
  successDesc: {
    fontFamily: Typography.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
});
