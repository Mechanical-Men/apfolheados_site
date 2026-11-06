import { earnings, earningsHint, formatMoney, parseMoney, ratePercent } from '../lib/reseller';

// Calculadora de ganhos de /revendedora e /seja-revendedora.

const byId = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const pieces = byId<HTMLInputElement>('earnings-pieces');
const average = byId<HTMLInputElement>('earnings-average');

function render() {
  const result = earnings(Number(pieces.value), parseMoney(average.value));
  byId('earnings-pieces-value').textContent = pieces.value;
  byId('earnings-amount').textContent = formatMoney(result.amount);
  byId('earnings-total').textContent = formatMoney(result.total);
  byId('earnings-rate').textContent = ratePercent(result);
  byId('earnings-hint').textContent = earningsHint(result);
}

pieces.addEventListener('input', render);
average.addEventListener('input', render);
byId('ganhos').addEventListener('submit', event => event.preventDefault());
// O navegador pode restaurar os campos ao voltar para a página.
render();
