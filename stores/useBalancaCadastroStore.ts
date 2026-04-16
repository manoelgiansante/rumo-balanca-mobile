import { create } from 'zustand';
import { safeQuery, supabase } from '../lib/supabase';
import type {
  BalaCliente,
  BalaMotorista,
  BalaPlaca,
  BalaProduto,
  BalaTransportadora,
  CadastroTable,
} from '../types/database';

interface CadastroState {
  produtos: BalaProduto[];
  placas: BalaPlaca[];
  motoristas: BalaMotorista[];
  transportadoras: BalaTransportadora[];
  clientes: BalaCliente[];
  loading: Record<CadastroTable, boolean>;
  error: string | null;

  fetchAll: () => Promise<void>;
  fetch: (table: CadastroTable) => Promise<void>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (table: CadastroTable, payload: Record<string, any>) => Promise<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (table: CadastroTable, id: string, payload: Record<string, any>) => Promise<boolean>;
  remove: (table: CadastroTable, id: string) => Promise<boolean>;
}

const emptyLoading: Record<CadastroTable, boolean> = {
  bala_produto: false,
  bala_placa: false,
  bala_motorista: false,
  bala_transportadora: false,
  bala_cliente: false,
};

export const useBalancaCadastroStore = create<CadastroState>((set, get) => ({
  produtos: [],
  placas: [],
  motoristas: [],
  transportadoras: [],
  clientes: [],
  loading: emptyLoading,
  error: null,

  fetchAll: async () => {
    await Promise.all([
      get().fetch('bala_produto'),
      get().fetch('bala_placa'),
      get().fetch('bala_motorista'),
      get().fetch('bala_transportadora'),
      get().fetch('bala_cliente'),
    ]);
  },

  fetch: async (table) => {
    set((s) => ({ loading: { ...s.loading, [table]: true }, error: null }));

    try {
      const rows = await safeQuery<Record<string, unknown>>(() =>
        supabase
          .from(table)
          .select('*')
          .eq('ativo', true)
          .order('nome', { ascending: true })
      );

      set((s) => {
        const patch: Partial<CadastroState> = {
          loading: { ...s.loading, [table]: false },
        };
        switch (table) {
          case 'bala_produto':
            patch.produtos = rows as unknown as BalaProduto[];
            break;
          case 'bala_placa':
            patch.placas = rows as unknown as BalaPlaca[];
            break;
          case 'bala_motorista':
            patch.motoristas = rows as unknown as BalaMotorista[];
            break;
          case 'bala_transportadora':
            patch.transportadoras = rows as unknown as BalaTransportadora[];
            break;
          case 'bala_cliente':
            patch.clientes = rows as unknown as BalaCliente[];
            break;
        }
        return patch as CadastroState;
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : `Erro ao carregar ${table}`;
      console.warn(`[cadastro] fetch ${table} error:`, msg);
      set((s) => ({ loading: { ...s.loading, [table]: false }, error: msg }));
    }
  },

  create: async (table, payload) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ error: 'Usuário não autenticado' });
      return false;
    }
    const insert = { ...payload, owner_id: user.id };
    const { error } = await supabase
      .from(table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insert as any);
    if (error) {
      set({ error: error.message });
      return false;
    }
    await get().fetch(table);
    return true;
  },

  update: async (table, id, payload) => {
    const { error } = await supabase
      .from(table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ ...payload, updated_at: new Date().toISOString() } as any)
      .eq('id', id);
    if (error) {
      set({ error: error.message });
      return false;
    }
    await get().fetch(table);
    return true;
  },

  remove: async (table, id) => {
    // Soft delete
    const { error } = await supabase
      .from(table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ ativo: false, updated_at: new Date().toISOString() } as any)
      .eq('id', id);
    if (error) {
      set({ error: error.message });
      return false;
    }
    await get().fetch(table);
    return true;
  },
}));
