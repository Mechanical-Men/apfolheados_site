import test from 'node:test';
import assert from 'node:assert/strict';
import { products } from '../src/data/products.ts';
import { contactMessage, filterProducts, shareMessage, validPhone, whatsappUrl } from '../src/lib/catalog.ts';

test('filtro por categoria', () => {
  assert.equal(filterProducts('todas').length, products.length);
  assert.equal(filterProducts('brincos').length, 4);
  assert.deepEqual(filterProducts('aneis').map(product => product.code), ['AP-3008']);
});

test('telefone aceita DDD, formatação e código do país', () => {
  for (const phone of ['(22) 99999-9999', '+55 (22) 99999-9999', '2238221234', '5538221234']) assert.equal(validPhone(phone), true, phone);
  for (const phone of ['', '99999-9999', '00000000000', '11111111111', '01234567890', '552299999999999']) assert.equal(validPhone(phone), false, phone);
});

test('mensagem preserva caracteres e não inclui indicação vazia', () => {
  const message = contactMessage({ nome: '  Ana & Bia  ', whatsapp: '(22) 99999-9999', cidade: 'Itaperuna / RJ', experiencia: 'Quero começar', indicacao: '  ' });
  assert.ok(message.includes('Meu nome: Ana & Bia\n'));
  assert.ok(!message.includes('Indicação:'));
  const url = new URL(whatsappUrl(message, '+55 (22) 99999-9999'));
  assert.equal(url.hostname, 'wa.me');
  assert.equal(url.pathname, '/5522999999999');
  assert.equal(url.searchParams.get('text'), message);
  assert.equal(new URL(whatsappUrl(message)).pathname, '/');
});

test('compartilhamento leva nome e código da peça', () => {
  const message = shareMessage(products[0]!);
  assert.ok(message.includes(products[0]!.name));
  assert.ok(message.includes(products[0]!.code));
  assert.ok(!/demonstrativ|ilustrativ/i.test(message));
});
