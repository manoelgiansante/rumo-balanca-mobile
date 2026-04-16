import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// ── GUARD: Rumo Balança vai na instância SHARED. Rumo Máquinas é INTOCÁVEL. ──
if (supabaseUrl.includes('byfgflxlmcdciupjpoaz')) {
  throw new Error(
    '[rumo-balanca] FATAL: EXPO_PUBLIC_SUPABASE_URL aponta pro projeto do Rumo Máquinas ' +
      '(byfgflxlmcdciupjpoaz). Rumo Balança deve usar jxcnfyeemdltdfqtgbcl (shared). ' +
      'Corrija o .env imediatamente.'
  );
}

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL ou EXPO_PUBLIC_SUPABASE_ANON_KEY ausentes. ' +
      'Auth e queries não vão funcionar.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Verifica se o erro indica que a tabela ainda não foi criada no schema.
 */
function isTableMissingError(error: { code?: string; message: string }): boolean {
  return (
    error.code === 'PGRST106' ||
    error.code === '42P01' ||
    /relation .* does not exist/i.test(error.message) ||
    /could not find the table/i.test(error.message)
  );
}

/**
 * Helper: executa query Supabase e degrada graciosamente se tabela ainda não existir
 * (schema sendo criado em paralelo por outro agent).
 * Retorna array vazio em caso de PGRST106 (schema cache miss) ou 42P01 (undefined_table).
 * Todos os outros erros são propagados (throw) para que o caller possa tratá-los.
 */
export async function safeQuery<T>(
  fn: () => PromiseLike<{ data: T[] | null; error: { code?: string; message: string } | null }>
): Promise<T[]> {
  const { data, error } = await fn();
  if (error) {
    if (isTableMissingError(error)) {
      // eslint-disable-next-line no-console
      console.warn('[supabase] tabela ainda não criada, retornando [].', error.message);
      return [];
    }
    throw new Error(`[supabase] ${error.code ?? 'error'}: ${error.message}`);
  }
  return data ?? [];
}
