import { brand } from '../config/brand';

// Comportamentos comuns a todas as páginas: menu, cabeçalho, diálogos, aviso e privacidade.

export function element<T extends Element = HTMLElement>(selector: string): T {
  const result = document.querySelector<T>(selector);
  if (!result) throw new Error(`Missing page element: ${selector}`);
  return result;
}

export const icon = (name: string) => `<svg class="icon" aria-hidden="true"><use href="#${name}"/></svg>`;
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]!));
export const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let toastTimer: ReturnType<typeof setTimeout>;
export function toast(message: string) {
  const target = element('#toast');
  target.textContent = message;
  target.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => target.classList.remove('visible'), 3000);
}

export async function copyText(text: string) {
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

const returnFocus = new WeakMap<HTMLDialogElement, Element | null>();
export function showDialog(id: string) {
  const dialog = element<HTMLDialogElement>(`#${id}`);
  returnFocus.set(dialog, document.activeElement);
  document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(other => {
    if (other !== dialog) other.close();
  });
  if (!dialog.open) dialog.showModal();
  dialog.querySelector<HTMLElement>('button,a,input,textarea')?.focus();
}

export function showPrivacy() {
  element('#resource-title').textContent = 'Sobre seus dados.';
  // [PREENCHER: revisar com advogado(a) e completar a política de privacidade (LGPD) antes de abrir o cadastro]
  // [PREENCHER: prazo de guarda dos dados] (mock: enquanto durar a parceria; cadastros não aprovados, 6 meses)
  element('#resource-content').innerHTML = `
    <h3>Cadastro de revendedora</h3>
    <p>Os dados e os documentos enviados no cadastro ficam guardados em um servidor, com acesso restrito à equipe da AP Folheados. Eles são usados para analisar o seu cadastro, falar com você e, se a parceria for aprovada, organizar a revenda.</p>
    <p>Guardamos esses dados enquanto durar a parceria. Se o cadastro não for aprovado, eles são apagados em até 6 meses.</p>
    <p>Você pode pedir a qualquer momento para ver, corrigir ou apagar os seus dados pelo WhatsApp ${brand.whatsappDisplay}.</p>
    <p>Ao abrir o WhatsApp, o uso do aplicativo segue as condições e políticas do serviço.</p>`;
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
window.matchMedia('(min-width: 1025px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

document.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLElement>('[data-close],[data-privacy]');
  if (button?.dataset.close) element<HTMLDialogElement>(`#${button.dataset.close}`).close();
  if (button?.hasAttribute('data-privacy')) showPrivacy();
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

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  requestAnimationFrame(() => { element('.header').classList.toggle('scrolled', window.scrollY > 15); ticking = false; });
  ticking = true;
}, { passive: true });

document.documentElement.classList.add('js-enabled');
