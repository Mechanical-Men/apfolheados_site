import catalogSource from '../config/catalog-source.json';
import { categoryLabel, productTitle, type Product } from '../data/products';
import { shareMessage, whatsappUrl } from '../lib/catalog';
import { fetchPublishedCatalog } from '../lib/published-catalog';
import { copyText, element, escapeHtml, icon, showDialog, toast } from './shell';

// Peças na home e em /catalogo: cartão, janela de detalhes e catálogo atualizado online.

let openProduct: Product | undefined;

// A foto de hover só aparece com mouse: no celular ela dobraria o download sem nunca ser vista.
const hoverScreen = window.matchMedia('(hover:hover) and (min-width:768px)');
function loadHoverPhotos() {
  if (!hoverScreen.matches) return;
  document.querySelectorAll<HTMLImageElement>('.photo-worn[data-src]').forEach(image => {
    image.src = image.dataset.src!;
    image.removeAttribute('data-src');
  });
}
hoverScreen.addEventListener('change', loadHoverPhotos);
loadHoverPhotos();

export function showProduct(product: Product) {
  openProduct = product;
  const title = escapeHtml(productTitle(product));
  const [photo] = product.photos;
  const reference = product.name ? `REFERÊNCIA ${escapeHtml(product.code)}` : categoryLabel(product.category).toUpperCase();
  const thumbs = product.photos.length > 1
    ? `<div class="piece-thumbs" role="group" aria-label="Fotos da peça">${product.photos.map((item, index) =>
      `<button data-photo="${index}" aria-pressed="${index === 0}" aria-label="Foto ${index + 1} de ${product.photos.length}"><img src="${escapeHtml(item.thumb)}" alt="" width="120" height="150"></button>`).join('')}</div>`
    : '';
  element('#piece-content').innerHTML = `
    <div class="piece-layout">
      <div class="piece-gallery">
        <img class="piece-large-photo" src="${escapeHtml(photo!.large)}" alt="${title}" width="900" height="1125">
        ${thumbs}
      </div>
      <div class="piece-info">
        <span class="eyebrow">UM DETALHE PARA CONHECER</span>
        <h2 id="piece-title"${product.name ? '' : ' class="is-code"'}>${title}</h2><span class="piece-ref">${reference}</span>
        <p>Baixe a foto ou compartilhe com a sua cliente. Para consultar a disponibilidade, envie o código para a equipe da AP.</p>
        <a class="button black" href="${whatsappUrl(shareMessage(product))}" target="_blank" rel="noopener noreferrer">Compartilhar referência ${icon('up-right')}</a>
        <div class="piece-options">
          <a id="piece-download" href="${escapeHtml(photo!.download)}" download>${icon('download')}Baixar foto</a>
          <button data-copy-code="${escapeHtml(product.code)}">${icon('copy')}Copiar código</button>
          <button data-copy-link="${escapeHtml(product.code)}">${icon('copy')}Copiar link</button>
        </div>
      </div>
    </div>`;
  showDialog('piece-dialog');
}

function selectPhoto(index: number) {
  const photo = openProduct?.photos[index];
  if (!photo) return;
  element<HTMLImageElement>('.piece-large-photo').src = photo.large;
  element<HTMLAnchorElement>('#piece-download').href = photo.download;
  document.querySelectorAll('[data-photo]').forEach(button => button.setAttribute('aria-pressed', String(button.getAttribute('data-photo') === String(index))));
}

export function publishedCard(p: Product) {
 const title=escapeHtml(productTitle(p)),code=escapeHtml(p.code),photo=p.primaryPhoto||p.photos[0],hover=p.hoverPhoto;
 return `<article class="product-card ${hover?'has-worn':''}" data-product="${code}"><div class="product-photo"><button class="photo-button" data-view="${code}" aria-label="Ver detalhes de ${title}"><img src="${escapeHtml(photo.card)}" alt="${title}" width="600" height="750" loading="lazy" decoding="async">${hover?`<img class="photo-worn" data-src="${escapeHtml(hover.card)}" alt="" width="600" height="750" loading="lazy" decoding="async">`:''}<span class="photo-caption-hover">VER ESTE DETALHE ↗</span></button></div><div class="product-meta"><div><h3 class="${p.name?'':'is-code'}">${title}</h3><div class="product-code"><span>${p.name?code:escapeHtml(categoryLabel(p.category))}</span><button class="copy-code" data-copy-code="${code}" aria-label="Copiar referência ${code}">${p.name?'copiar':'copiar código'}</button></div></div><button class="quick-arrow" data-view="${code}" aria-label="Ver ${title}">${icon('up-right')}</button></div><div class="product-actions"><a href="${escapeHtml(whatsappUrl(shareMessage(p)))}" target="_blank" rel="noopener noreferrer">${icon('message')}Compartilhar</a><a href="${escapeHtml(photo.download)}" download aria-label="Baixar foto de ${title}">${icon('download')}<span>Foto</span></a></div></article>`;
}

/** Liga os botões de ver peça, trocar foto e copiar. `onOpen` avisa quando a janela da peça abre. */
export function setupProductActions(find: (code: string) => Product | undefined, onOpen?: (product: Product) => void) {
  document.addEventListener('click', async event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLElement>('button,a');
    if (!button) return;
    if (button.dataset.view) {
      const product = find(button.dataset.view);
      if (product) { showProduct(product); onOpen?.(product); }
    }
    if (button.dataset.photo) selectPhoto(Number(button.dataset.photo));
    if (button.dataset.copyCode) {
      const copied = await copyText(button.dataset.copyCode);
      toast(copied ? 'Referência copiada.' : 'Referência: ' + button.dataset.copyCode);
    }
    if (button.dataset.copyLink) {
      const link = `${location.origin}/catalogo?peca=${encodeURIComponent(button.dataset.copyLink)}`;
      toast(await copyText(link) ? 'Link da peça copiado.' : link);
    }
  });
}

/**
 * Mantém a lista igual ao catálogo publicado: ao abrir a página, a cada minuto e ao voltar para a aba.
 * A promessa devolvida termina depois da primeira atualização.
 */
export function watchPublishedCatalog(current: () => Product[], apply: (products: Product[]) => void) {
  let refreshing = false;
  async function refresh() {
    if (catalogSource.source !== 'supabase' || refreshing || document.hidden) return;
    refreshing = true;
    try {
      const next = await fetchPublishedCatalog();
      if (JSON.stringify(next) === JSON.stringify(current())) return;
      apply(next);
      loadHoverPhotos();
      if (openProduct) {
        openProduct = next.find(product => product.code === openProduct?.code);
        if (!openProduct) element<HTMLDialogElement>('#piece-dialog').close();
      }
    } catch { /* Keep the last successfully loaded catalog when offline. */ } finally {
      refreshing = false;
    }
  }
  setInterval(() => void refresh(), 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) void refresh(); });
  return refresh();
}
