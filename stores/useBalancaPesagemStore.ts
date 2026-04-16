import { create } from 'zustand';
import { safeQuery, supabase } from '../lib/supabase';
import type {
  BalaPesagem,
  PesagemInsert,
  StatusPesagem,
  TipoOperacao,
} from '../types/database';
import { calcularLiquido } from '../utils/format';

interface PesagemState {
  pesagens: BalaPesagem[];
  loading: boolean;
  error: string | null;
  currentId: string | null;

  // Queries
  fetchAll: () => Promise<void>;
  fetchById: (id: string) => Promise<BalaPesagem | null>;
  fetchAguardando: () => BalaPesagem[];
  fetchConcluidasHoje: () => BalaPesagem[];

  // State machine transitions
  criarPesagem: (payload: {
    tipo_operacao: TipoOperacao;
    placa: string;
    motorista_nome: string;
    motorista_doc?: string | null;
    motorista_id?: string | null;
    produto_id?: string | null;
    produto_nome: string;
    cliente_id?: string | null;
    cliente_nome?: string | null;
    transportadora_id?: string | null;
    transportadora_nome?: string | null;
    observacoes?: string | null;
  }) => Promise<BalaPesagem | null>;

  registrarBruto: (id: string, peso_bruto_kg: number) => Promise<BalaPesagem | null>;
  registrarTara: (
    id: string,
    payload: {
      peso_tara_kg: number;
      umidade_pct?: number | null;
      impureza_pct?: number | null;
      umidade_base?: number;
    }
  ) => Promise<BalaPesagem | null>;
  concluir: (id: string) => Promise<BalaPesagem | null>;
  cancelar: (id: string, motivo?: string) => Promise<void>;

  // Fotos
  anexarFoto: (
    id: string,
    campo: 'foto_entrada_url' | 'foto_saida_url',
    url: string
  ) => Promise<void>;

  setCurrentId: (id: string | null) => void;
}

export const useBalancaPesagemStore = create<PesagemState>((set, get) => ({
  pesagens: [],
  loading: false,
  error: null,
  currentId: null,

  setCurrentId: (id) => set({ currentId: id }),

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const rows = await safeQuery<BalaPesagem>(() =>
        supabase
          .from('bala_pesagem')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500)
      );
      set({ pesagens: rows, loading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar pesagens';
      set({ loading: false, error: msg });
    }
  },

  fetchById: async (id) => {
    const { data, error } = await supabase
      .from('bala_pesagem')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      // eslint-disable-next-line no-console
      console.warn('[pesagem] fetchById error', error.message);
      return null;
    }
    if (data) {
      const row = data as BalaPesagem;
      set((s) => {
        const existsIdx = s.pesagens.findIndex((p) => p.id === row.id);
        const next = [...s.pesagens];
        if (existsIdx >= 0) next[existsIdx] = row;
        else next.unshift(row);
        return { pesagens: next };
      });
      return row;
    }
    return null;
  },

  fetchAguardando: () =>
    get().pesagens.filter(
      (p) => p.status === 'aguardando' || p.status === 'pesagem_bruta'
    ),

  fetchConcluidasHoje: () => {
    const today = new Date().toISOString().slice(0, 10);
    return get().pesagens.filter(
      (p) =>
        p.status === 'concluida' &&
        typeof p.created_at === 'string' &&
        p.created_at.startsWith(today)
    );
  },

  criarPesagem: async (payload) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ error: 'Usuário não autenticado' });
      return null;
    }

    const insertRow: PesagemInsert = {
      owner_id: user.id,
      tipo_operacao: payload.tipo_operacao,
      placa: payload.placa,
      motorista_nome: payload.motorista_nome,
      motorista_doc: payload.motorista_doc ?? null,
      motorista_id: payload.motorista_id ?? null,
      produto_id: payload.produto_id ?? null,
      produto_nome: payload.produto_nome,
      cliente_id: payload.cliente_id ?? null,
      cliente_nome: payload.cliente_nome ?? null,
      transportadora_id: payload.transportadora_id ?? null,
      transportadora_nome: payload.transportadora_nome ?? null,
      observacoes: payload.observacoes ?? null,
      status: 'aguardando',
    };

    const { data, error } = await supabase
      .from('bala_pesagem')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insertRow as any)
      .select()
      .single();

    if (error || !data) {
      set({ error: error?.message ?? 'Falha ao criar pesagem' });
      return null;
    }
    const row = data as BalaPesagem;
    set((s) => ({ pesagens: [row, ...s.pesagens], currentId: row.id }));
    return row;
  },

  registrarBruto: async (id, peso_bruto_kg) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('bala_pesagem')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({
        peso_bruto_kg,
        bruta_em: now,
        status: 'pesagem_bruta',
        updated_at: now,
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      set({ error: error?.message ?? 'Falha ao registrar peso bruto' });
      return null;
    }
    const row = data as BalaPesagem;
    set((s) => ({
      pesagens: s.pesagens.map((p) => (p.id === id ? row : p)),
    }));
    return row;
  },

  registrarTara: async (id, { peso_tara_kg, umidade_pct, impureza_pct, umidade_base }) => {
    const current = get().pesagens.find((p) => p.id === id);
    if (!current) {
      set({ error: 'Pesagem não encontrada' });
      return null;
    }
    if (current.peso_bruto_kg == null) {
      set({ error: 'Registre peso bruto antes da tara' });
      return null;
    }

    const { liquido, desconto, final } = calcularLiquido(
      current.peso_bruto_kg,
      peso_tara_kg,
      umidade_pct ?? null,
      impureza_pct ?? null,
      umidade_base ?? 14
    );

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('bala_pesagem')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({
        peso_tara_kg,
        peso_liquido_kg: liquido,
        umidade_pct: umidade_pct ?? null,
        impureza_pct: impureza_pct ?? null,
        desconto_kg: desconto,
        peso_final_kg: final,
        tara_em: now,
        status: 'pesagem_tara',
        updated_at: now,
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      set({ error: error?.message ?? 'Falha ao registrar tara' });
      return null;
    }
    const row = data as BalaPesagem;
    set((s) => ({
      pesagens: s.pesagens.map((p) => (p.id === id ? row : p)),
    }));
    return row;
  },

  concluir: async (id) => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('bala_pesagem')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({
        status: 'concluida',
        saida_em: now,
        updated_at: now,
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      set({ error: error?.message ?? 'Falha ao concluir pesagem' });
      return null;
    }
    const row = data as BalaPesagem;
    set((s) => ({
      pesagens: s.pesagens.map((p) => (p.id === id ? row : p)),
    }));
    return row;
  },

  cancelar: async (id, motivo) => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('bala_pesagem')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({
        status: 'cancelada' satisfies StatusPesagem,
        observacoes: motivo ?? null,
        updated_at: now,
      } as any)
      .eq('id', id);

    if (error) {
      set({ error: error.message });
      return;
    }
    set((s) => ({
      pesagens: s.pesagens.map((p) =>
        p.id === id
          ? { ...p, status: 'cancelada' as StatusPesagem, observacoes: motivo ?? p.observacoes, updated_at: now }
          : p
      ),
    }));
  },

  anexarFoto: async (id, campo, url) => {
    const { error } = await supabase
      .from('bala_pesagem')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ [campo]: url, updated_at: new Date().toISOString() } as any)
      .eq('id', id);
    if (error) {
      // eslint-disable-next-line no-console
      console.warn('[pesagem] anexarFoto error', error.message);
      return;
    }
    set((s) => ({
      pesagens: s.pesagens.map((p) => (p.id === id ? { ...p, [campo]: url } : p)),
    }));
  },
}));
