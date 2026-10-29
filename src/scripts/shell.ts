import { brand } from '../config/brand';
import { element, showDialog } from './ui';

export * from './ui';

// Comportamentos comuns às páginas do site: menu, cabeçalho e privacidade.

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
  if (event.target instanceof Element && event.target.closest('[data-privacy]')) showPrivacy();
});

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  requestAnimationFrame(() => { element('.header').classList.toggle('scrolled', window.scrollY > 15); ticking = false; });
  ticking = true;
}, { passive: true });

document.documentElement.classList.add('js-enabled');
