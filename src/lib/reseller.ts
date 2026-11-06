// Regras da Área da Revendedora: comissão, ganhos e marcações de texto.

/** Até este total vendido no ciclo a comissão é de 30%; acima dele, 35% sobre o total. */
export const COMMISSION_LIMIT = 350;

export function commission(total: number) {
  const rate = total > COMMISSION_LIMIT ? 0.35 : 0.3;
  return { rate, amount: Math.round(total * rate * 100) / 100 };
}

export interface Earnings { total: number; rate: number; amount: number; piecesToTopRate: number }

/** Ganho em um ciclo e quantas peças faltam para passar de R$ 350 (0 se já passou). */
export function earnings(pieces: number, average: number): Earnings {
  const total = Math.round(pieces * average * 100) / 100;
  const piecesToTopRate = total > COMMISSION_LIMIT || average <= 0 ? 0 : Math.floor(COMMISSION_LIMIT / average) + 1 - pieces;
  return { total, ...commission(total), piecesToTopRate };
}

export const ratePercent = ({ rate }: Pick<Earnings, 'rate'>) => `${Math.round(rate * 100)}%`;

export function earningsHint({ total, piecesToTopRate: missing }: Earnings) {
  if (total <= 0) return 'Informe o valor médio de cada peça.';
  if (missing > 0) return `Com mais ${missing} ${missing === 1 ? 'peça' : 'peças'} no ciclo, sua comissão sobe para 35%.`;
  return 'Passou de R$ 350 no ciclo: 35% sobre o total vendido.';
}

export const formatMoney = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\s/g, ' ');

/** Lê o valor como a pessoa digita: 1500, 1.500, 1500,50 ou R$ 1.500,50. Sem número, devolve 0. */
export function parseMoney(value: string) {
  const text = value.replace(/[^\d.,]/g, '');
  const normalized = text.includes(',')
    ? text.replace(/\./g, '').replace(',', '.')
    : /\.\d{3}(\.|$)/.test(text) ? text.replace(/\./g, '') : text;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

/** Marcador nos textos de src/data/reseller.ts para informação que a AP ainda vai confirmar. */
export const TO_CONFIRM = '{{a-confirmar}}';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]!));

/** Texto seguro para set:html, com a etiqueta "A confirmar" no lugar do marcador. */
export const richText = (text: string) => escapeHtml(text).replaceAll(TO_CONFIRM, '<span class="to-confirm">A confirmar</span>');

/** Destaca os [campos] que a revendedora troca antes de enviar a mensagem. */
export const markFields = (text: string) => escapeHtml(text).replace(/\[[^\]]+\]/g, field => `<mark>${field}</mark>`);
