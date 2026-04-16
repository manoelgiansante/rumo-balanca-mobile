import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TicketPDFOptions } from './ticket-pdf';

const KEYS = {
  nome: '@balanca:empresa_nome',
  cnpj: '@balanca:empresa_cnpj',
  endereco: '@balanca:empresa_endereco',
} as const;

export { KEYS as EMPRESA_KEYS };

/**
 * Lê as configurações de empresa do AsyncStorage para uso no PDF do ticket.
 */
export async function getEmpresaConfig(): Promise<TicketPDFOptions> {
  const [nome, cnpj, endereco] = await AsyncStorage.multiGet([
    KEYS.nome,
    KEYS.cnpj,
    KEYS.endereco,
  ]);
  return {
    empresa: nome[1] ?? undefined,
    cnpj: cnpj[1] ?? undefined,
    endereco: endereco[1] ?? undefined,
  };
}
