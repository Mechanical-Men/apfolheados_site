import { brand } from '../config/brand';
import { careGuideText, careTips, clientMessageTemplate } from '../data/content';
import { products, productDownloadName, productImage } from '../data/products';
import {
  PAGE_SIZE, contactMessage, filterProducts, shareMessage, validPhone, whatsappUrl,
  type CatalogCategory, type ContactValues,
} from '../lib/catalog';

function element<T extends Element = HTMLElement>(selector: string): T {
  const result = document.querySelector<T>(selector);
  if (!result) throw new Error(`Missing page element: ${selector}`);
  return result;
}

const icon = (name: string) => `<svg class="icon" aria-hidden="true"><use href="#${name}"/></svg>`;
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]!));
let category: CatalogCategory = 'todas';
let limit = PAGE_SIZE;
let toastTimer: ReturnType<typeof setTimeout>;
const cards = [...document.querySelectorAll<HTMLElement>('[data-product]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function toast(message: string) {
  const target = element('#toast');
  target.textContent = message;
  target.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => target.classList.remove('visible'), 3000);
}

async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const previousFocus = document.activeElement;
    const input = document.createElement('textarea');
    input.value = text;
    input.style.cssText = 'position:fixed;left:-9999px;top:0';
    // A textarea outside an open modal is inert and cannot be selected.
    (document.querySelector('dialog[open]') || document.body).append(input);
    input.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { /* User can copy manually. */ }
    input.remove();
    if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    return copied;
  }
}

function renderCatalog() {
  const list = filterProducts(category);
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

const returnFocus = new WeakMap<HTMLDialogElement, Element | null>();
function showDialog(id: string) {
  const dialog = element<HTMLDialogElement>(`#${id}`);
  returnFocus.set(dialog, document.activeElement);
  document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(other => {
    if (other !== dialog) other.close();
  });
  if (!dialog.open) dialog.showModal();
  dialog.querySelector<HTMLElement>('button,a,input,textarea')?.focus();
}

function showProduct(code: string) {
  const product = products.find(item => item.code === code);
  if (!product) return;
  const name = escapeHtml(product.name);
  const image = productImage(product);
  element('#piece-content').innerHTML = `
    <div class="piece-layout">
      <img class="piece-large-photo" src="${image}" alt="${name}" width="600" height="750">
      <div class="piece-info">
        <span class="eyebrow">UM DETALHE PARA CONHECER</span>
        <h2 id="piece-title">${name}</h2><span class="piece-ref">REFERÊNCIA ${escapeHtml(product.code)}</span>
        <p>Baixe a foto ou compartilhe com a sua cliente. Para consultar a disponibilidade, envie o código para a equipe da AP.</p>
        <a class="button black" href="${whatsappUrl(shareMessage(product))}" target="_blank" rel="noopener noreferrer">Compartilhar referência ${icon('up-right')}</a>
        <div class="piece-options">
          <a href="${image}" download="${productDownloadName(product)}">${icon('download')}Baixar foto</a>
          <button data-copy-code="${product.code}">${icon('copy')}Copiar código</button>
        </div>
      </div>
    </div>`;
  showDialog('piece-dialog');
}

function showResource(kind: string) {
  element('#resource-title').textContent = kind === 'messages' ? 'Uma conversa começa aqui.' : 'Para o seu brilho durar.';
  element('#resource-content').innerHTML = kind === 'messages'
    ? `<p>Uma sugestão para personalizar com o seu jeito de falar. Confirme os modelos e a disponibilidade antes de oferecer as peças.</p><label class="sr-only" for="message-template">Modelo de mensagem editável</label><textarea id="message-template" rows="5">${clientMessageTemplate}</textarea><button class="button black" data-copy-template>Copiar minha mensagem ${icon('copy')}</button>`
    : `<p>Pequenos cuidados para o dia a dia.</p><ul>${careTips.map(tip => `<li>${tip}</li>`).join('')}</ul><p>Consulte a AP para orientações específicas.</p><button class="button black" data-download-care>Baixar guia de cuidados ${icon('download')}</button>`;
  showDialog('resource-dialog');
}

function setMenu(open: boolean) {
  document.body.classList.toggle('menu-open', open);
  element('#menu-toggle').setAttribute('aria-expanded', String(open));
  element('#menu-toggle').setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}

element('#menu-toggle').addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
element('#navigation').addEventListener('click', event => {
  if (event.target instanceof Element && event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
element('#load-more').addEventListener('click', () => {
  const firstNew = filterProducts(category)[limit];
  limit += PAGE_SIZE;
  renderCatalog();
  if (firstNew) cards.find(card => card.dataset.product === firstNew.code)?.querySelector<HTMLButtonElement>('[data-view]')?.focus({ preventScroll: true });
});

document.addEventListener('click', async event => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLElement>('button,a');
  if (!button) return;
  if (button.dataset.category) { category = button.dataset.category as CatalogCategory; limit = PAGE_SIZE; renderCatalog(); }
  if (button.dataset.view) showProduct(button.dataset.view);
  if (button.dataset.copyCode) {
    const copied = await copyText(button.dataset.copyCode);
    toast(copied ? 'Referência copiada.' : 'Referência: ' + button.dataset.copyCode);
  }
  if (button.dataset.close) element<HTMLDialogElement>(`#${button.dataset.close}`).close();
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

document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (document.querySelector('dialog[open]')) return;
    const target = returnFocus.get(dialog);
    if (target instanceof HTMLElement && target.isConnected && !target.closest('dialog:not([open])') && !target.closest('[hidden]')) target.focus({ preventScroll: true });
  });
});

const form = element<HTMLFormElement>('#resale-form');
const phone = element<HTMLInputElement>('#contact-phone');
form.addEventListener('submit', event => {
  event.preventDefault();
  const phoneIsValid = validPhone(phone.value);
  phone.setCustomValidity(phoneIsValid ? '' : 'Informe um WhatsApp válido com DDD.');
  phone.setAttribute('aria-invalid', String(!phoneIsValid));
  if (!form.reportValidity()) return;
  const fields = new FormData(form);
  const values: ContactValues = {
    nome: String(fields.get('nome') || ''), whatsapp: String(fields.get('whatsapp') || ''),
    cidade: String(fields.get('cidade') || ''), experiencia: String(fields.get('experiencia') || ''),
    indicacao: String(fields.get('indicacao') || ''),
  };
  const message = contactMessage(values);
  element<HTMLTextAreaElement>('#contact-message').value = message;
  element<HTMLAnchorElement>('#contact-whatsapp').href = whatsappUrl(message, brand.whatsapp);
  if (brand.whatsapp) {
    const link = element('#contact-whatsapp');
    link.firstChild!.textContent = 'Abrir conversa com a AP ';
    element('#contact-dialog > p').textContent = 'Confira o texto e abra a conversa com a AP no WhatsApp.';
  }
  showDialog('contact-dialog');
});
// Only enable a client-only form after the handler has been attached.
element<HTMLButtonElement>('#resale-form button[type="submit"]').disabled = false;
phone.addEventListener('input', () => { phone.setCustomValidity(''); phone.removeAttribute('aria-invalid'); });
element('#contact-copy').addEventListener('click', async () => {
  const copied = await copyText(element<HTMLTextAreaElement>('#contact-message').value);
  toast(copied ? 'Mensagem copiada.' : 'Selecione o texto para copiar.');
});
element('#privacy-open').addEventListener('click', () => {
  element('#resource-title').textContent = 'Sobre seus dados.';
  element('#resource-content').innerHTML = '<p>Os dados do formulário são usados apenas para preparar a mensagem que você decide enviar pelo WhatsApp. Este site não envia um cadastro automaticamente e não grava os campos do formulário em um servidor.</p><p>Ao abrir o WhatsApp, o uso do aplicativo segue as condições e políticas do serviço.</p>';
  showDialog('resource-dialog');
});

renderCatalog();
document.documentElement.classList.add('js-enabled');

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  requestAnimationFrame(() => { element('.header').classList.toggle('scrolled', window.scrollY > 15); ticking = false; });
  ticking = true;
}, { passive: true });

if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.querySelectorAll('.section-top,.story-copy,.resale-content,.resource-row').forEach(target => {
    target.classList.add('reveal'); observer.observe(target);
  });
}
window.matchMedia('(min-width: 1025px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

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

prev.addEventListener('click', () => goToSlide(currentSlide() - 1));
next.addEventListener('click', () => goToSlide(currentSlide() + 1));
dots.addEventListener('click', event => {
  const dot = event.target instanceof Element && event.target.closest('button');
  if (dot) goToSlide([...dots.children].indexOf(dot));
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
