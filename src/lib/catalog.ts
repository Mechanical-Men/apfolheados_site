import { categories, categoryLabel, isCategory, productTitle, type Product, type Category } from '../data/products.ts';

export type CatalogCategory = Category | 'todas';
/** Pieces shown per page in the catalogue. */
export const PAGE_SIZE = 12;
/** Peças por página em /catalogo. */
export const CATALOG_PAGE_SIZE = 24;

export const filterProducts = (products: readonly Product[], category: CatalogCategory) =>
  products.filter(product => category === 'todas' || product.category === category);

const plain = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const compact = (value: string) => plain(value).replace(/[^a-z0-9]/g, '');

/** Busca por nome, código ou categoria, sem acento; o código também vale sem hífen (br00001). */
export function searchProducts(products: readonly Product[], query: string) {
  const words = plain(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [...products];
  const code = compact(query);
  return products.filter(product => {
    const text = plain(`${product.name ?? ''} ${product.code} ${product.category} ${categoryLabel(product.category)}`);
    return words.every(word => text.includes(word)) || Boolean(code && compact(product.code).includes(code));
  });
}

export type CatalogSort = 'recentes' | 'nome' | 'codigo';
export const catalogSorts: readonly { id: CatalogSort; label: string }[] = [
  { id: 'recentes', label: 'Mais recentes' },
  { id: 'nome', label: 'Nome (A a Z)' },
  { id: 'codigo', label: 'Código' },
];

const compareText = (a: string, b: string) => a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' });

/** "recentes" mantém a ordem do banco, que já vem das mais novas para as mais antigas. */
export function sortProducts(products: readonly Product[], sort: CatalogSort) {
  if (sort === 'nome') return [...products].sort((a, b) => compareText(productTitle(a), productTitle(b)));
  if (sort === 'codigo') return [...products].sort((a, b) => compareText(a.code, b.code));
  return [...products];
}

export function countByCategory(products: readonly Product[]) {
  const counts = Object.fromEntries(categories.map(category => [category.id, 0])) as Record<CatalogCategory, number>;
  counts.todas = products.length;
  for (const product of products) counts[product.category] += 1;
  return counts;
}

export interface CatalogQuery { category: CatalogCategory; search: string; sort: CatalogSort }

/** Filtros guardados no endereço, para a busca poder ser compartilhada. */
export function readCatalogQuery(params: URLSearchParams): CatalogQuery {
  const category = params.get('categoria');
  const sort = catalogSorts.find(item => item.id === params.get('ordem'))?.id ?? 'recentes';
  return { category: isCategory(category) ? category : 'todas', search: (params.get('busca') ?? '').slice(0, 60), sort };
}

export function catalogQueryParams({ category, search, sort }: CatalogQuery) {
  const params = new URLSearchParams();
  if (category !== 'todas') params.set('categoria', category);
  if (search.trim()) params.set('busca', search.trim());
  if (sort !== 'recentes') params.set('ordem', sort);
  return params;
}

export const piecesLabel = (count: number) => `${count} ${count === 1 ? 'peça na seleção' : 'peças na seleção'}`;

export function validPhone(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) digits = digits.slice(2);
  return /^(?!([0-9])\1+$)[1-9]{2}\d{8,9}$/.test(digits);
}

export const shareMessage = (product: Product) => `Olha esta peça da AP Folheados: ${product.name ? `${product.name} (${product.code})` : product.code}. Quer que eu separe para você?`;

export const faqMessage = 'Olá, AP Folheados! Tenho uma dúvida sobre a revenda.';

export const whatsappUrl = (message: string, number = '') => `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
