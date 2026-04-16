/**
 * Rumo Balança — Database types matching bala_* Supabase schema.
 * Project: jxcnfyeemdltdfqtgbcl (shared). NUNCA byfgflxlmcdciupjpoaz.
 *
 * Re-gen with:
 *   npx supabase gen types typescript --project-id jxcnfyeemdltdfqtgbcl --schema public > types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Enums ──────────────────────────────────────────────────

export type StatusPesagem =
  | 'aguardando'
  | 'pesagem_bruta'
  | 'pesagem_tara'
  | 'concluida'
  | 'cancelada';

export type TipoOperacao = 'entrada' | 'saida';

export type TipoPlaca = 'mercosul' | 'antigo';

export type UnidadePeso = 'kg' | 't';

// ── Row types ──────────────────────────────────────────────

export interface BalaPesagem {
  id: string;
  owner_id: string;
  numero_ticket: number;
  tipo_operacao: TipoOperacao;
  status: StatusPesagem;
  placa: string;
  motorista_nome: string;
  motorista_doc: string | null;
  motorista_id: string | null;
  produto_id: string | null;
  produto_nome: string;
  cliente_id: string | null;
  cliente_nome: string | null;
  transportadora_id: string | null;
  transportadora_nome: string | null;
  peso_bruto_kg: number | null;
  peso_tara_kg: number | null;
  peso_liquido_kg: number | null;
  umidade_pct: number | null;
  impureza_pct: number | null;
  desconto_kg: number | null;
  peso_final_kg: number | null;
  observacoes: string | null;
  foto_entrada_url: string | null;
  foto_saida_url: string | null;
  entrada_em: string;
  bruta_em: string | null;
  tara_em: string | null;
  saida_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface BalaProduto {
  id: string;
  owner_id: string;
  nome: string;
  unidade: UnidadePeso;
  umidade_base_pct: number | null;
  notes: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface BalaPlaca {
  id: string;
  owner_id: string;
  placa: string;
  tipo: TipoPlaca;
  descricao: string | null;
  transportadora_id: string | null;
  tara_padrao_kg: number | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface BalaMotorista {
  id: string;
  owner_id: string;
  nome: string;
  cpf: string | null;
  phone: string | null;
  cnh: string | null;
  notes: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface BalaTransportadora {
  id: string;
  owner_id: string;
  nome: string;
  cnpj: string | null;
  phone: string | null;
  notes: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface BalaCliente {
  id: string;
  owner_id: string;
  nome: string;
  cpf_cnpj: string | null;
  phone: string | null;
  notes: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// ── Insert/Update helper types ─────────────────────────────

export type PesagemInsert = {
  owner_id: string;
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
  status?: StatusPesagem;
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type PesagemUpdate = Partial<BalaPesagem>;

// ── Supabase Database interface ────────────────────────────

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
      bala_pesagem: {
        Row: BalaPesagem;
        Insert: PesagemInsert;
        Update: PesagemUpdate;
        Relationships: [];
      };
      bala_produto: {
        Row: BalaProduto;
        Insert: Omit<BalaProduto, 'id' | 'created_at' | 'updated_at' | 'ativo'> & {
          id?: string;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<BalaProduto>;
        Relationships: [];
      };
      bala_placa: {
        Row: BalaPlaca;
        Insert: Omit<BalaPlaca, 'id' | 'created_at' | 'updated_at' | 'ativo'> & {
          id?: string;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<BalaPlaca>;
        Relationships: [];
      };
      bala_motorista: {
        Row: BalaMotorista;
        Insert: Omit<BalaMotorista, 'id' | 'created_at' | 'updated_at' | 'ativo'> & {
          id?: string;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<BalaMotorista>;
        Relationships: [];
      };
      bala_transportadora: {
        Row: BalaTransportadora;
        Insert: Omit<BalaTransportadora, 'id' | 'created_at' | 'updated_at' | 'ativo'> & {
          id?: string;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<BalaTransportadora>;
        Relationships: [];
      };
      bala_cliente: {
        Row: BalaCliente;
        Insert: Omit<BalaCliente, 'id' | 'created_at' | 'updated_at' | 'ativo'> & {
          id?: string;
          ativo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<BalaCliente>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      bala_status_pesagem: StatusPesagem;
      bala_tipo_operacao: TipoOperacao;
      bala_tipo_placa: TipoPlaca;
      bala_unidade_peso: UnidadePeso;
    };
  };
}

// Shared cadastro union (for useBalancaCadastroStore)
export type CadastroTable =
  | 'bala_produto'
  | 'bala_placa'
  | 'bala_motorista'
  | 'bala_transportadora'
  | 'bala_cliente';

export type CadastroRow =
  | BalaProduto
  | BalaPlaca
  | BalaMotorista
  | BalaTransportadora
  | BalaCliente;
