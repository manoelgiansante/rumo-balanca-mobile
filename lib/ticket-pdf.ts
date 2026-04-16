import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { BalaPesagem } from '../types/database';
import {
  formatDateTimeBR,
  formatPeso,
  formatTicket,
  stripPlaca,
} from '../utils/format';

function escapeHtml(str: string | number | null | undefined): string {
  if (str == null) return '—';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface TicketPDFOptions {
  empresa?: string;
  cnpj?: string;
  endereco?: string;
}

/**
 * Gera HTML do ticket de pesagem. Usado tanto na view quanto no PDF.
 */
export function buildTicketHTML(
  pesagem: BalaPesagem,
  opts: TicketPDFOptions = {}
): string {
  const empresa = escapeHtml(opts.empresa ?? 'Rumo Balança');
  const cnpj = opts.cnpj ? escapeHtml(opts.cnpj) : '';
  const endereco = opts.endereco ? escapeHtml(opts.endereco) : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Ticket ${escapeHtml(formatTicket(pesagem.numero_ticket))}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #0F172A; font-size: 12px; }
    .header { text-align: center; border-bottom: 2px solid #0B3D2E; padding-bottom: 12px; margin-bottom: 16px; }
    .empresa { font-size: 20px; font-weight: 700; color: #0B3D2E; }
    .cnpj { font-size: 11px; color: #64748B; margin-top: 2px; }
    .ticket-num { font-size: 18px; font-weight: 700; color: #C89B3C; margin-top: 8px; letter-spacing: 1px; }
    .section { margin-bottom: 14px; }
    .section-title { font-size: 11px; font-weight: 700; color: #0B3D2E; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; }
    .row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; }
    .label { color: #64748B; }
    .value { font-weight: 600; color: #0F172A; }
    .pesos { background: #F5F6F3; padding: 12px; border-radius: 8px; margin-top: 8px; }
    .pesos .row { padding: 4px 0; }
    .total { border-top: 2px solid #0B3D2E; margin-top: 8px; padding-top: 8px; font-size: 14px; }
    .total .value { color: #0B3D2E; font-size: 16px; }
    .obs { margin-top: 12px; padding: 8px; background: #F5F6F3; border-radius: 6px; font-size: 11px; color: #4B5563; }
    .signatures { display: flex; gap: 16px; margin-top: 32px; }
    .sig { flex: 1; text-align: center; }
    .sig-line { border-top: 1px solid #0F172A; margin-bottom: 4px; height: 40px; }
    .sig-label { font-size: 10px; color: #64748B; }
    .footer { text-align: center; margin-top: 24px; font-size: 9px; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="header">
    <div class="empresa">${empresa}</div>
    ${cnpj ? `<div class="cnpj">CNPJ: ${cnpj}</div>` : ''}
    ${endereco ? `<div class="cnpj">${endereco}</div>` : ''}
    <div class="ticket-num">TICKET ${escapeHtml(formatTicket(pesagem.numero_ticket))}</div>
  </div>

  <div class="section">
    <div class="section-title">Operação</div>
    <div class="row"><span class="label">Tipo</span><span class="value">${escapeHtml(pesagem.tipo_operacao.toUpperCase())}</span></div>
    <div class="row"><span class="label">Status</span><span class="value">${escapeHtml(pesagem.status.toUpperCase())}</span></div>
    <div class="row"><span class="label">Produto</span><span class="value">${escapeHtml(pesagem.produto_nome)}</span></div>
  </div>

  <div class="section">
    <div class="section-title">Veículo e Motorista</div>
    <div class="row"><span class="label">Placa</span><span class="value">${escapeHtml(pesagem.placa)}</span></div>
    <div class="row"><span class="label">Motorista</span><span class="value">${escapeHtml(pesagem.motorista_nome)}</span></div>
    ${pesagem.motorista_doc ? `<div class="row"><span class="label">CPF/Doc</span><span class="value">${escapeHtml(pesagem.motorista_doc)}</span></div>` : ''}
    ${pesagem.transportadora_nome ? `<div class="row"><span class="label">Transportadora</span><span class="value">${escapeHtml(pesagem.transportadora_nome)}</span></div>` : ''}
    ${pesagem.cliente_nome ? `<div class="row"><span class="label">Cliente</span><span class="value">${escapeHtml(pesagem.cliente_nome)}</span></div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">Tempos</div>
    <div class="row"><span class="label">Entrada</span><span class="value">${escapeHtml(formatDateTimeBR(pesagem.entrada_em))}</span></div>
    <div class="row"><span class="label">Pesagem bruta</span><span class="value">${escapeHtml(formatDateTimeBR(pesagem.bruta_em))}</span></div>
    <div class="row"><span class="label">Pesagem tara</span><span class="value">${escapeHtml(formatDateTimeBR(pesagem.tara_em))}</span></div>
    ${pesagem.saida_em ? `<div class="row"><span class="label">Saída</span><span class="value">${escapeHtml(formatDateTimeBR(pesagem.saida_em))}</span></div>` : ''}
  </div>

  <div class="section pesos">
    <div class="section-title" style="border-bottom:none;padding-bottom:0;margin-bottom:4px;">Pesos</div>
    <div class="row"><span class="label">Bruto</span><span class="value">${escapeHtml(formatPeso(pesagem.peso_bruto_kg, true))}</span></div>
    <div class="row"><span class="label">Tara</span><span class="value">${escapeHtml(formatPeso(pesagem.peso_tara_kg, true))}</span></div>
    <div class="row"><span class="label">Líquido</span><span class="value">${escapeHtml(formatPeso(pesagem.peso_liquido_kg, true))}</span></div>
    ${pesagem.umidade_pct != null ? `<div class="row"><span class="label">Umidade</span><span class="value">${escapeHtml(pesagem.umidade_pct.toFixed(1))}%</span></div>` : ''}
    ${pesagem.impureza_pct != null ? `<div class="row"><span class="label">Impureza</span><span class="value">${escapeHtml(pesagem.impureza_pct.toFixed(1))}%</span></div>` : ''}
    ${pesagem.desconto_kg != null && pesagem.desconto_kg > 0 ? `<div class="row"><span class="label">Desconto</span><span class="value">- ${escapeHtml(formatPeso(pesagem.desconto_kg, true))}</span></div>` : ''}
    <div class="row total"><span class="label">PESO FINAL</span><span class="value">${escapeHtml(formatPeso(pesagem.peso_final_kg ?? pesagem.peso_liquido_kg, true))}</span></div>
  </div>

  ${pesagem.observacoes ? `<div class="obs"><strong>Observações:</strong> ${escapeHtml(pesagem.observacoes)}</div>` : ''}

  <div class="signatures">
    <div class="sig">
      <div class="sig-line"></div>
      <div class="sig-label">Motorista (${escapeHtml(stripPlaca(pesagem.placa))})</div>
    </div>
    <div class="sig">
      <div class="sig-line"></div>
      <div class="sig-label">Operador de balança</div>
    </div>
  </div>

  <div class="footer">
    Gerado em ${escapeHtml(formatDateTimeBR(new Date()))} • Rumo Balança
  </div>
</body>
</html>`;
}

/**
 * Gera PDF do ticket e retorna o URI local.
 */
export async function generateTicketPDF(
  pesagem: BalaPesagem,
  opts?: TicketPDFOptions
): Promise<string> {
  const html = buildTicketHTML(pesagem, opts);
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
    width: 595, // A4 width in points
    height: 842,
  });
  return uri;
}

/**
 * Abre share-sheet nativo para compartilhar o PDF.
 */
export async function shareTicketPDF(
  pesagem: BalaPesagem,
  opts?: TicketPDFOptions
): Promise<void> {
  const uri = await generateTicketPDF(pesagem, opts);
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Compartilhamento indisponível neste dispositivo.');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: `Ticket ${formatTicket(pesagem.numero_ticket)}`,
  });
}

/**
 * Imprime direto (se impressora conectada).
 */
export async function printTicket(
  pesagem: BalaPesagem,
  opts?: TicketPDFOptions
): Promise<void> {
  const html = buildTicketHTML(pesagem, opts);
  await Print.printAsync({ html });
}
