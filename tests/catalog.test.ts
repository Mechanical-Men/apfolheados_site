import test from 'node:test';
import assert from 'node:assert/strict';
import type { Product } from '../src/data/products.ts';

const photo = { card: 'c.jpg', large: 'l.jpg', thumb: 't.jpg', download: 'd.jpg' };
const products: Product[] = [
  { code: 'AP-1042', category: 'brincos', photos: [photo] },
  { code: 'AP-1120', category: 'brincos', photos: [photo, photo] },
  { code: 'AP-3008', name: 'Anel Solitário', category: 'aneis', photos: [photo] },
];
import { contactMessage, filterProducts, shareMessage, validPhone, whatsappUrl } from '../src/lib/catalog.ts';

test('filtro por categoria', () => {
  assert.equal(filterProducts(products, 'todas').length, products.length);
  assert.equal(filterProducts(products, 'brincos').length, 2);
  assert.deepEqual(filterProducts(products, 'aneis').map(product => product.code), ['AP-3008']);
  assert.equal(filterProducts(products, 'colares').length, 0);
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

test('compartilhamento usa o nome quando existe, senão o código', () => {
  const withName = shareMessage(products[2]!);
  assert.ok(withName.includes('Anel Solitário (AP-3008)'));
  const codeOnly = shareMessage(products[0]!);
  assert.ok(codeOnly.includes(': AP-1042.'));
  assert.ok(!codeOnly.includes('undefined'));
});
