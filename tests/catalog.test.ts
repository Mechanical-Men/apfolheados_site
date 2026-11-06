import test from 'node:test';
import assert from 'node:assert/strict';
import type { Product } from '../src/data/products.ts';

const photo = { card: 'c.jpg', large: 'l.jpg', thumb: 't.jpg', download: 'd.jpg' };
const products: Product[] = [
  { code: 'AP-1042', category: 'brincos', photos: [photo] },
  { code: 'AP-1120', category: 'brincos', photos: [photo, photo] },
  { code: 'AP-3008', name: 'Anel Solitário', category: 'aneis', photos: [photo] },
];
import {
  catalogQueryParams, countByCategory, faqMessage, filterProducts, readCatalogQuery, searchProducts, shareMessage, sortProducts, validPhone, whatsappUrl,
} from '../src/lib/catalog.ts';

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

test('link do WhatsApp leva número e mensagem', () => {
  const url = new URL(whatsappUrl(faqMessage, '+55 (22) 99926-4479'));
  assert.equal(url.hostname, 'wa.me');
  assert.equal(url.pathname, '/5522999264479');
  assert.equal(url.searchParams.get('text'), faqMessage);
  assert.equal(new URL(whatsappUrl(faqMessage)).pathname, '/');
});

test('compartilhamento usa o nome quando existe, senão o código', () => {
  const withName = shareMessage(products[2]!);
  assert.ok(withName.includes('Anel Solitário (AP-3008)'));
  const codeOnly = shareMessage(products[0]!);
  assert.ok(codeOnly.includes(': AP-1042.'));
  assert.ok(!codeOnly.includes('undefined'));
});

test('busca por nome sem acento, código com ou sem hífen e categoria', () => {
  const codes = (query: string) => searchProducts(products, query).map(product => product.code);
  assert.deepEqual(codes(''), ['AP-1042', 'AP-1120', 'AP-3008']);
  assert.deepEqual(codes('   '), ['AP-1042', 'AP-1120', 'AP-3008']);
  assert.deepEqual(codes('solitario'), ['AP-3008']);
  assert.deepEqual(codes('anel soli'), ['AP-3008']);
  assert.deepEqual(codes('ap-1042'), ['AP-1042']);
  assert.deepEqual(codes('ap1042'), ['AP-1042']);
  assert.deepEqual(codes('brincos'), ['AP-1042', 'AP-1120']);
  assert.deepEqual(codes('brinco'), ['AP-1042', 'AP-1120']);
  assert.deepEqual(codes('aneis'), ['AP-3008']);
  assert.deepEqual(codes('colar'), []);
  // Só pontuação não pode virar "tudo".
  assert.deepEqual(codes('#'), []);
});

test('ordenação mantém a original e não altera a lista recebida', () => {
  const codes = (sort: Parameters<typeof sortProducts>[1]) => sortProducts(products, sort).map(product => product.code);
  assert.deepEqual(codes('recentes'), ['AP-1042', 'AP-1120', 'AP-3008']);
  assert.deepEqual(codes('nome'), ['AP-3008', 'AP-1042', 'AP-1120']);
  assert.deepEqual(sortProducts([products[2]!, products[1]!, products[0]!], 'codigo').map(product => product.code), ['AP-1042', 'AP-1120', 'AP-3008']);
  assert.equal(products[0]!.code, 'AP-1042');
});

test('contagem por categoria inclui as vazias', () => {
  const counts = countByCategory(products);
  assert.equal(counts.todas, 3);
  assert.equal(counts.brincos, 2);
  assert.equal(counts.aneis, 1);
  assert.equal(counts.colares, 0);
});

test('filtros vão e voltam pelo endereço', () => {
  const query = { category: 'brincos', search: 'argola fina', sort: 'nome' } as const;
  assert.deepEqual(readCatalogQuery(catalogQueryParams(query)), query);
  assert.equal(catalogQueryParams({ category: 'todas', search: '  ', sort: 'recentes' }).toString(), '');
  assert.deepEqual(readCatalogQuery(new URLSearchParams('categoria=xyz&ordem=preco')), { category: 'todas', search: '', sort: 'recentes' });
});
