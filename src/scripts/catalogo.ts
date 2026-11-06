import type { Product } from '../data/products';
import {
  CATALOG_PAGE_SIZE, catalogQueryParams, countByCategory, filterProducts, piecesLabel, readCatalogQuery, searchProducts, sortProducts,
  type CatalogCategory, type CatalogSort,
} from '../lib/catalog';
import { publishedCard, setupProductActions, showProduct, watchPublishedCatalog } from './products';
import { element, toast } from './shell';

// Página /catalogo: busca, filtro por categoria, ordenação e link direto para cada peça.

const initialParams = new URLSearchParams(location.search);
const state = readCatalogQuery(initialParams);
let products: Product[] = JSON.parse(element('#catalog-data').textContent || '[]');
let limit = CATALOG_PAGE_SIZE;
let openCode: string | null = null;

const grid = element('#product-grid');
const empty = element('#catalog-empty');
const search = element<HTMLInputElement>('#catalog-search');
const sort = element<HTMLSelectElement>('#catalog-sort');
const clear = element<HTMLButtonElement>('#catalog-clear');
const reset = element<HTMLButtonElement>('[data-reset]');

const readCards = () => new Map([...grid.querySelectorAll<HTMLElement>('[data-product]')].map(card => [card.dataset.product!, card]));
let cards = readCards();

const filtering = () => Boolean(state.search.trim()) || state.category !== 'todas';
const results = () => sortProducts(filterProducts(searchProducts(products, state.search), state.category), state.sort);

function syncUrl() {
  const params = catalogQueryParams(state);
  if (openCode) params.set('peca', openCode);
  const query = params.toString();
  history.replaceState(null, '', query ? `?${query}` : location.pathname);
}

let urlTimer: ReturnType<typeof setTimeout>;
function render() {
  const list = results();
  const shown = list.slice(0, limit);
  const codes = new Set(shown.map(product => product.code));
  cards.forEach((card, code) => { card.hidden = !codes.has(code); });
  // Na ordem da lista, antes do aviso de "nenhuma peça".
  shown.forEach(product => { const card = cards.get(product.code); if (card) grid.insertBefore(card, empty); });

  const counts = countByCategory(searchProducts(products, state.search));
  const inCatalog = countByCategory(products);
  document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(button => {
    const id = button.dataset.category as CatalogCategory;
    button.setAttribute('aria-pressed', String(id === state.category));
    button.hidden = id !== 'todas' && inCatalog[id] === 0 && id !== state.category;
    button.querySelector('[data-count]')!.textContent = String(counts[id]);
  });

  empty.hidden = list.length > 0;
  element('#catalog-empty-title').textContent = products.length ? 'Nenhuma peça encontrada.' : 'Em breve, novos detalhes.';
  element('#catalog-empty-text').textContent = products.length ? 'Confira o nome ou o código, ou veja as outras categorias.' : 'Ainda não há peças por aqui.';
  reset.hidden = !products.length;
  clear.hidden = !filtering();
  element('#results-count').textContent = piecesLabel(list.length);
  element('#remaining-count').textContent = list.length > limit ? `+${list.length - limit}` : '';
  element('#load-more').hidden = list.length <= limit;

  // Com pausa: o navegador limita as trocas de endereço, e a busca muda a cada tecla.
  clearTimeout(urlTimer);
  urlTimer = setTimeout(syncUrl, 300);
}

function clearFilters() {
  state.category = 'todas';
  state.search = '';
  search.value = '';
  limit = CATALOG_PAGE_SIZE;
  render();
}

search.addEventListener('input', () => { state.search = search.value; limit = CATALOG_PAGE_SIZE; render(); });
sort.addEventListener('change', () => { state.sort = sort.value as CatalogSort; limit = CATALOG_PAGE_SIZE; render(); });
clear.addEventListener('click', () => { clearFilters(); search.focus(); });
reset.addEventListener('click', () => { clearFilters(); search.focus(); });

document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(button => button.addEventListener('click', () => {
  state.category = button.dataset.category as CatalogCategory;
  limit = CATALOG_PAGE_SIZE;
  render();
}));

element('#load-more').addEventListener('click', () => {
  const firstNew = results()[limit];
  limit += CATALOG_PAGE_SIZE;
  render();
  if (firstNew) cards.get(firstNew.code)?.querySelector<HTMLButtonElement>('[data-view]')?.focus({ preventScroll: true });
});

const findProduct = (code: string) => products.find(product => product.code === code);
setupProductActions(findProduct, product => { openCode = product.code; syncUrl(); });
element('#piece-dialog').addEventListener('close', () => { openCode = null; syncUrl(); });

search.value = state.search;
sort.value = state.sort;
render();

const firstRefresh = watchPublishedCatalog(() => products, next => {
  products = next;
  cards.forEach(card => card.remove());
  empty.insertAdjacentHTML('beforebegin', products.map(publishedCard).join(''));
  cards = readCards();
  render();
});

// Link direto (/catalogo?peca=AP-BR-00001). Peça publicada depois do build só existe após a primeira atualização.
const wanted = initialParams.get('peca');
function openWanted(code: string) {
  const product = findProduct(code);
  if (product) { openCode = code; showProduct(product); syncUrl(); }
  return Boolean(product);
}
if (wanted && !openWanted(wanted)) {
  void firstRefresh.then(() => {
    if (!openWanted(wanted)) { toast('Esta peça não está mais no catálogo.'); syncUrl(); }
  });
}
