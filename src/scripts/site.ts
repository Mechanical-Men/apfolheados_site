import { careGuideText, careTips, clientMessageTemplate } from '../data/content';
import type { Product } from '../data/products';
import { PAGE_SIZE, filterProducts, type CatalogCategory } from '../lib/catalog';
import { publishedCard, setupProductActions, watchPublishedCatalog } from './products';
import { copyText, element, icon, reducedMotion, showDialog, toast } from './shell';

// Página inicial: mostruário, Central da Revendedora, contato, depoimentos e FAQ.
let category: CatalogCategory = 'todas';
let limit = PAGE_SIZE;
let cards = [...document.querySelectorAll<HTMLElement>('[data-product]')];
// Catálogo Supabase publicado pelo AP Studio, com atualização online.
let products: Product[] = JSON.parse(element('#catalog-data').textContent || '[]');

function renderCatalog() {
  const list = filterProducts(products, category);
  const visible = new Set(list.slice(0, limit).map(product => product.code));
  cards.forEach(card => { card.hidden = !visible.has(card.dataset.product!); });
  element('#catalog-empty').hidden = list.length > 0;
  element('#results-count').textContent = `${list.length} ${list.length === 1 ? 'peça na seleção' : 'peças na seleção'}`;
  element('#remaining-count').textContent = list.length > limit ? `+${list.length - limit}` : '';
  element('#load-more').hidden = list.length <= limit;
  document.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.category === category));
  });
}

function showResource(kind: string) {
  element('#resource-title').textContent = kind === 'messages' ? 'Uma conversa começa aqui.' : 'Para o seu brilho durar.';
  element('#resource-content').innerHTML = kind === 'messages'
    ? `<p>Uma sugestão para personalizar com o seu jeito de falar. Confirme os modelos e a disponibilidade antes de oferecer as peças.</p><label class="sr-only" for="message-template">Modelo de mensagem editável</label><textarea id="message-template" rows="5">${clientMessageTemplate}</textarea><button class="button black" data-copy-template>Copiar minha mensagem ${icon('copy')}</button>`
    : `<p>Pequenos cuidados para o dia a dia.</p><ul>${careTips.map(tip => `<li>${tip}</li>`).join('')}</ul><p>Consulte a AP para orientações específicas.</p><button class="button black" data-download-care>Baixar guia de cuidados ${icon('download')}</button>`;
  showDialog('resource-dialog');
}

element('#load-more').addEventListener('click', () => {
  const firstNew = filterProducts(products, category)[limit];
  limit += PAGE_SIZE;
  renderCatalog();
  if (firstNew) cards.find(card => card.dataset.product === firstNew.code)?.querySelector<HTMLButtonElement>('[data-view]')?.focus({ preventScroll: true });
});

document.addEventListener('click', async event => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLElement>('button,a');
  if (!button) return;
  if (button.dataset.category) { category = button.dataset.category as CatalogCategory; limit = PAGE_SIZE; renderCatalog(); }
  if (button.dataset.resource) showResource(button.dataset.resource);
  if (button.hasAttribute('data-copy-template')) {
    const copied = await copyText(element<HTMLTextAreaElement>('#message-template').value);
    toast(copied ? 'Sua mensagem foi copiada.' : 'Selecione e copie o texto da mensagem.');
  }
  if (button.hasAttribute('data-download-care')) {
    const url = URL.createObjectURL(new Blob([careGuideText], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AP-Folheados-Cuidados.txt';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (button.hasAttribute('data-reset')) {
    category = 'todas'; limit = PAGE_SIZE;
    renderCatalog();
    element<HTMLButtonElement>('[data-category="todas"]').focus({ preventScroll: true });
  }
});

setupProductActions(code => products.find(product => product.code === code));
renderCatalog();

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.section-top,.story-copy,.resale-content,.resource-row').forEach(target => {
    target.classList.add('reveal'); observer.observe(target);
  });
}

// Carrossel de depoimentos: setas e indicadores sobre uma faixa com scroll-snap.
const track = element('#testimonial-track');
const slides = [...track.children] as HTMLElement[];
const dots = element('#testimonial-dots');
const prev = element<HTMLButtonElement>('[data-carousel-prev]');
const next = element<HTMLButtonElement>('[data-carousel-next]');
const slideStep = () => slides.length > 1 ? slides[1]!.offsetLeft - slides[0]!.offsetLeft : track.clientWidth;
const positions = () => Math.max(1, slides.length - Math.round((track.clientWidth + 1) / slideStep()) + 1);
const currentSlide = () => Math.min(positions() - 1, Math.round(track.scrollLeft / slideStep()));
const goToSlide = (index: number) => track.scrollTo({ left: index * slideStep(), behavior: reducedMotion.matches ? 'instant' : 'smooth' });

function renderDots() {
  const count = positions();
  if (dots.children.length !== count) {
    dots.innerHTML = Array.from({ length: count }, (_, index) => `<button type="button" aria-label="Ir para o depoimento ${index + 1}"></button>`).join('');
  }
  updateCarousel();
}

function updateCarousel() {
  const index = currentSlide();
  const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  prev.disabled = track.scrollLeft <= 2;
  next.disabled = atEnd;
  [...dots.children].forEach((dot, dotIndex) => dot.setAttribute('aria-current', String(dotIndex === (atEnd ? positions() - 1 : index))));
}

prev.addEventListener('click', () => { goToSlide(currentSlide() - 1); scheduleAutoplay(); });
next.addEventListener('click', () => { goToSlide(currentSlide() + 1); scheduleAutoplay(); });
dots.addEventListener('click', event => {
  const dot = event.target instanceof Element && event.target.closest('button');
  if (dot) { goToSlide([...dots.children].indexOf(dot)); scheduleAutoplay(); }
});
track.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    goToSlide(currentSlide() + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
let carouselFrame = 0;
track.addEventListener('scroll', () => {
  cancelAnimationFrame(carouselFrame);
  carouselFrame = requestAnimationFrame(updateCarousel);
}, { passive: true });
window.addEventListener('resize', renderDots);
renderDots();

// Rotação automática: avança a cada 6s e volta ao início no fim. Não avança com o mouse ou
// o foco do teclado no carrossel, fora da tela, com a aba oculta, com "reduzir movimento" ou pausada.
const AUTOPLAY_MS = 6000;
const carousel = element('#depoimentos');
const pause = element<HTMLButtonElement>('[data-carousel-pause]');
let autoplayTimer: ReturnType<typeof setTimeout> | undefined;
let pausedByUser = false;
let touching = false;
let carouselInView = false;

const canAutoplay = () => !pausedByUser && carouselInView && !document.hidden && !reducedMotion.matches && positions() > 1;
// Estado lido na hora: mais confiável que pares mouseenter/mouseleave.
const isInteracting = () => touching || carousel.matches(':hover') || !!carousel.querySelector(':focus-visible');

function scheduleAutoplay() {
  clearTimeout(autoplayTimer);
  if (!canAutoplay()) return;
  autoplayTimer = setTimeout(() => {
    if (!isInteracting()) {
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      goToSlide(atEnd ? 0 : currentSlide() + 1);
    }
    scheduleAutoplay();
  }, AUTOPLAY_MS);
}

pause.addEventListener('click', () => {
  pausedByUser = !pausedByUser;
  pause.setAttribute('aria-pressed', String(pausedByUser));
  pause.setAttribute('aria-label', pausedByUser ? 'Retomar a rotação dos depoimentos' : 'Pausar a rotação dos depoimentos');
  pause.innerHTML = icon(pausedByUser ? 'play' : 'pause');
  scheduleAutoplay();
});
// Ao sair do carrossel, a contagem recomeça do zero.
carousel.addEventListener('mouseleave', scheduleAutoplay);
carousel.addEventListener('focusout', scheduleAutoplay);
track.addEventListener('touchstart', () => { touching = true; }, { passive: true });
track.addEventListener('touchend', () => { touching = false; scheduleAutoplay(); }, { passive: true });
document.addEventListener('visibilitychange', scheduleAutoplay);
reducedMotion.addEventListener('change', () => { pause.hidden = reducedMotion.matches; scheduleAutoplay(); });
pause.hidden = reducedMotion.matches;
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => { carouselInView = entry!.isIntersecting; scheduleAutoplay(); }, { threshold: 0.4 }).observe(track);
} else {
  carouselInView = true;
  scheduleAutoplay();
}

// FAQ: anima a altura ao abrir e fechar cada pergunta.
document.querySelectorAll<HTMLDetailsElement>('.faq details').forEach(details => {
  const summary = details.querySelector('summary')!;
  let animation: Animation | null = null;
  summary.addEventListener('click', event => {
    if (reducedMotion.matches || !details.animate) return;
    event.preventDefault();
    const closing = details.open && !details.classList.contains('closing');
    const start = details.offsetHeight;
    animation?.cancel();
    if (closing) details.classList.add('closing');
    else { details.classList.remove('closing'); details.open = true; }
    const style = getComputedStyle(details);
    const end = closing
      ? summary.offsetHeight + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)
      : details.offsetHeight;
    details.style.overflow = 'hidden';
    animation = details.animate({ height: [`${start}px`, `${end}px`] }, { duration: closing ? 260 : 380, easing: 'cubic-bezier(.2,.7,.2,1)' });
    animation.onfinish = () => {
      if (closing) { details.open = false; details.classList.remove('closing'); }
      details.style.overflow = '';
      animation = null;
    };
  });
});

void watchPublishedCatalog(() => products, next => {
  products = next;
  cards.forEach(card => card.remove());
  element('#catalog-empty').insertAdjacentHTML('beforebegin', products.map(publishedCard).join(''));
  cards = [...document.querySelectorAll<HTMLElement>('[data-product]')];
  renderCatalog();
});
