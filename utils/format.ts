/**
 * Formatters utilitários — Rumo Balança
 */

/** kg -> string humanamente legível (ex: 1.250 kg, 12,45 t) */
export function formatPeso(kg: number | null | undefined, forceKg = false): string {
  if (kg == null || isNaN(kg)) return '—';
  const abs = Math.abs(kg);
  if (!forceKg && abs >= 1000) {
    const t = kg / 1000;
    return `${t.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} t`;
  }
  return `${Math.round(kg).toLocaleString('pt-BR')} kg`;
}

/** string numérica digitada pelo usuário -> kg (aceita '1250', '1.250', '1250,5') */
export function parsePeso(input: string): number | null {
  if (!input) return null;
  const normalized = input.replace(/\./g, '').replace(',', '.').trim();
  const n = Number(normalized);
  if (!isFinite(n) || n < 0) return null;
  return n;
}

/** Placa -> máscara. Aceita Mercosul (ABC1D23) ou antigo (ABC1234). */
export function formatPlaca(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  if (clean.length <= 3) return clean;
  return `${clean.slice(0, 3)}-${clean.slice(3)}`;
}

/** Remove máscara de placa, retorna 7 chars UPPER */
export function stripPlaca(placa: string): string {
  return placa.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
}

/** Valida placa (Mercosul ABC1D23 ou antigo ABC1234). */
export function isValidPlaca(placa: string): boolean {
  const clean = stripPlaca(placa);
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(clean);
}

/** CPF 000.000.000-00 */
export function formatCPF(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** CNPJ 00.000.000/0000-00 */
export function formatCNPJ(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

/** Phone (11) 9 9999-9999 */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 3)} ${d.slice(3, 7)}-${d.slice(7)}`;
}

/** Apenas dígitos */
export function onlyDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}

/** ISO -> DD/MM/AAAA (coerce safe) */
export function formatDateBR(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    if (!(d instanceof Date) || isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('pt-BR');
  } catch {
    return '—';
  }
}

/** ISO -> DD/MM/AAAA HH:MM */
export function formatDateTimeBR(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    if (!(d instanceof Date) || isNaN(d.getTime())) return '—';
    return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  } catch {
    return '—';
  }
}

/** Hora HH:MM */
export function formatHora(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  try {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    if (!(d instanceof Date) || isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

/** Centavos -> R$ */
export function formatBRL(cents: number | null | undefined): string {
  if (cents == null || isNaN(cents)) return '—';
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/** Ticket numero padded #00042 */
export function formatTicket(n: number | null | undefined): string {
  if (n == null) return '—';
  return `#${String(n).padStart(5, '0')}`;
}

/**
 * Cálculo de desconto por umidade.
 * Se umidade > base (ex: 14%), desconta do peso líquido: liquido * (umidade - base) / 100.
 * Retorna kg a descontar.
 */
export function calcularDescontoUmidade(
  liquidoKg: number,
  umidadePct: number | null,
  basePct = 14
): number {
  if (umidadePct == null || umidadePct <= basePct) return 0;
  return Math.max(0, liquidoKg * ((umidadePct - basePct) / 100));
}

/**
 * Cálculo completo: dado peso_bruto, peso_tara, umidade, impureza, base, retorna
 * { liquido, desconto, final }.
 */
export function calcularLiquido(
  brutoKg: number,
  taraKg: number,
  umidadePct: number | null,
  impurezaPct: number | null,
  umidadeBase = 14
): { liquido: number; desconto: number; final: number } {
  const liquido = Math.max(0, brutoKg - taraKg);
  const descontoUmidade = calcularDescontoUmidade(liquido, umidadePct, umidadeBase);
  const descontoImpureza =
    impurezaPct != null && impurezaPct > 0 ? liquido * (impurezaPct / 100) : 0;
  const desconto = descontoUmidade + descontoImpureza;
  const final = Math.max(0, liquido - desconto);
  return {
    liquido: Math.round(liquido),
    desconto: Math.round(desconto),
    final: Math.round(final),
  };
}

/** Saudação conforme hora do dia. */
export function getGreeting(name?: string): string {
  const h = new Date().getHours();
  const base = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  return name ? `${base}, ${name.split(' ')[0]}` : base;
}
