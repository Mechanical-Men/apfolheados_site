// Utilitários de interface comuns ao site e ao /admin: diálogos, aviso (toast) e cópia.

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

document.addEventListener('click', event => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLElement>('[data-close]');
  if (button?.dataset.close) element<HTMLDialogElement>(`#${button.dataset.close}`).close();
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
