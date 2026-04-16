import { useCallback } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ViewStyle } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import { formatPlaca } from '../utils/format';

interface Props {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  mask?: 'placa' | 'cpf' | 'cnpj' | 'phone' | 'none';
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  autoCapitalize?: 'characters' | 'words' | 'sentences' | 'none';
  style?: ViewStyle;
  error?: string | null;
  onSubmitEditing?: () => void;
}

export function QuickEntryForm({
  label,
  value,
  onChange,
  placeholder,
  mask = 'none',
  keyboardType = 'default',
  multiline,
  autoCapitalize,
  style,
  error,
  onSubmitEditing,
}: Props) {
  const handleChange = useCallback(
    (raw: string) => {
      if (mask === 'placa') onChange(formatPlaca(raw));
      else onChange(raw);
    },
    [mask, onChange]
  );

  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          error ? styles.inputError : null,
        ]}
        value={value}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.muted}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize ?? (mask === 'placa' ? 'characters' : 'sentences')}
        returnKeyType={multiline ? 'default' : 'next'}
        onSubmitEditing={() => {
          if (onSubmitEditing) onSubmitEditing();
          else Keyboard.dismiss();
        }}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing.xs },
  label: {
    fontFamily: Typography.bodyMedium,
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
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
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.error,
  },
  error: {
    fontFamily: Typography.body,
    fontSize: 12,
    color: Colors.error,
  },
});
