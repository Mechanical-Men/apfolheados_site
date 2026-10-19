import test from 'node:test';
import assert from 'node:assert/strict';
import { products } from '../src/data/products.ts';
import { contactMessage, filterProducts, sanitizeSaved, shareMessage, validPhone, whatsappUrl } from '../src/lib/catalog.ts';

test('busca por nome sem acentos, maiúsculas e referência', () => {
  assert.deepEqual(filterProducts('todas', 'SOLITARIO').map(product => product.code), ['AP-3008']);
  assert.equal(filterProducts('todas', '  ap-2015  ')[0]?.name, 'Colar Gota Cristal');
  assert.equal(filterProducts('todas', 'inexistente').length, 0);
});

test('categoria, busca e favoritas são combinadas', () => {
  assert.equal(filterProducts('brincos', '').length, 4);
  assert.deepEqual(filterProducts('colares', 'gota', true, ['AP-2015']).map(product => product.code), ['AP-2015']);
  assert.equal(filterProducts('brincos', '', true, ['AP-2015']).length, 0);
});

test('favoritas armazenadas descartam dados desconhecidos ou inválidos', () => {
  assert.deepEqual(sanitizeSaved(['AP-1042', 'AP-1042', null, 42, '<script>', 'AP-2015']), ['AP-1042', 'AP-2015']);
  assert.deepEqual(sanitizeSaved({ code: 'AP-1042' }), []);
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
