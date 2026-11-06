import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TO_CONFIRM, commission, earnings, earningsHint, formatMoney, markFields, parseMoney, ratePercent, richText,
} from '../src/lib/reseller.ts';

test('comissão igual aos exemplos do kit', () => {
  for (const [total, rate, amount] of [[300, 0.3, 90], [750, 0.35, 262.5], [1000, 0.35, 350], [1500, 0.35, 525], [2000, 0.35, 700], [3000, 0.35, 1050]] as const) {
    assert.deepEqual(commission(total), { rate, amount }, String(total));
  }
});

test('comissão muda só acima de R$ 350', () => {
  assert.equal(commission(350).rate, 0.3);
  assert.equal(commission(350).amount, 105);
  assert.equal(commission(350.01).rate, 0.35);
  assert.equal(commission(0).amount, 0);
});

test('valor digitado de vários jeitos', () => {
  for (const [text, value] of [['1500', 1500], ['1.500', 1500], ['1.500,50', 1500.5], ['R$ 1.500,50', 1500.5], ['1500,5', 1500.5], ['150.50', 150.5], ['1.000.000', 1000000], ['', 0], ['abc', 0]] as const) {
    assert.equal(parseMoney(text), value, text);
  }
  assert.equal(formatMoney(262.5), 'R$ 262,50');
  assert.equal(formatMoney(1050), 'R$ 1.050,00');
});

test('calculadora igual à simulação do kit (R$ 150 por peça)', () => {
  for (const [pieces, total, rate, amount] of [[2, 300, '30%', 90], [5, 750, '35%', 262.5], [10, 1500, '35%', 525], [20, 3000, '35%', 1050]] as const) {
    const result = earnings(pieces, 150);
    assert.deepEqual([result.total, ratePercent(result), result.amount], [total, rate, amount], String(pieces));
  }
});

test('peças que faltam para passar de R$ 350', () => {
  assert.equal(earnings(2, 150).piecesToTopRate, 1);
  assert.equal(earnings(1, 150).piecesToTopRate, 2);
  // Exatamente R$ 350 ainda é 30%: precisa de mais uma peça.
  assert.equal(earnings(2, 175).piecesToTopRate, 1);
  assert.equal(earnings(3, 150).piecesToTopRate, 0);
  assert.equal(earnings(10, 0).piecesToTopRate, 0);
});

test('aviso da calculadora', () => {
  assert.equal(earningsHint(earnings(2, 150)), 'Com mais 1 peça no ciclo, sua comissão sobe para 35%.');
  assert.equal(earningsHint(earnings(1, 100)), 'Com mais 3 peças no ciclo, sua comissão sobe para 35%.');
  assert.equal(earningsHint(earnings(5, 150)), 'Passou de R$ 350 no ciclo: 35% sobre o total vendido.');
  assert.equal(earningsHint(earnings(5, 0)), 'Informe o valor médio de cada peça.');
});

test('textos escapam HTML e marcam o que falta', () => {
  assert.equal(richText(`Garantia de ${TO_CONFIRM}.`), 'Garantia de <span class="to-confirm">A confirmar</span>.');
  assert.equal(richText('<b>'), '&lt;b&gt;');
  assert.equal(markFields('Oi, [nome]! <b>'), 'Oi, <mark>[nome]</mark>! &lt;b&gt;');
});
