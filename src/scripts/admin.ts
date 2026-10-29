import { whatsappUrl } from '../lib/catalog';
import {
  adminConfigured, documentLinks, hasSession, listApplications, SessionExpiredError, signIn, signOut, updateStatus,
} from '../lib/admin';
import {
  ageOn, countByStatus, documentKind, formatDateTime, formatIsoDate, isStatus, phoneMaybeTruncated, searchApplications, statuses,
  statusLabel, type Application, type ApplicationStatus,
} from '../lib/applications';
import { formatCep, formatCpf, formatPhone } from '../lib/registration';
import { copyText, element, escapeHtml, icon, showDialog, toast } from './ui';

// Página /admin: login, lista dos cadastros e detalhes com documentos e status.

const screens = ['login', 'loading', 'not-configured', 'list'] as const;
function show(screen: typeof screens[number]) {
  for (const name of screens) element(`#admin-${name}`).hidden = name !== screen;
  element('#admin-sign-out').hidden = screen !== 'list';
}

let applications: Application[] = [];
let filter: ApplicationStatus | 'todos' = 'todos';
let openId: string | null = null;

const search = element<HTMLInputElement>('#admin-search');
const cards = element('#admin-cards');
const listError = element('#admin-list-error');

function showLogin(message = '') {
  const notice = element('#admin-login-message');
  notice.textContent = message;
  notice.hidden = !message;
  show('login');
  element<HTMLInputElement>('#admin-email').focus();
}

/** Sessão expirada no meio do uso volta para o login; outros erros aparecem na lista. */
function handleError(error: unknown, fallback: string) {
  if (error instanceof SessionExpiredError) { showLogin('Sua sessão expirou. Entre de novo.'); return; }
  console.warn('[admin]', error);
  toast(fallback);
}

const place = (app: Application) => `${app.cidade}/${app.uf}`;
const firstName = (app: Application) => app.nome.split(' ')[0] ?? app.nome;
const phoneLink = (app: Application) => whatsappUrl(`Olá, ${firstName(app)}! Aqui é da AP Folheados, sobre o seu cadastro de revendedora.`, `55${app.whatsapp}`);
const yesNo = (value: boolean) => value ? 'Sim' : 'Não';

function renderList() {
  const counts = countByStatus(applications);
  document.querySelectorAll<HTMLElement>('[data-count]').forEach(target => {
    target.textContent = String(counts[target.dataset.count as keyof typeof counts]);
  });
  const visible = searchApplications(applications, search.value, filter);
  element('#admin-count').textContent = !applications.length
    ? 'Nenhum cadastro recebido ainda.'
    : visible.length ? `${visible.length} ${visible.length === 1 ? 'cadastro' : 'cadastros'}` : 'Nenhum cadastro com esses filtros.';
  cards.innerHTML = visible.map(app => `
    <li><button type="button" class="admin-card" data-id="${app.id}">
      <span class="status-badge is-${app.status}">${statusLabel(app.status)}</span>
      <strong>${escapeHtml(app.nome)}</strong>
      <span>${escapeHtml(place(app))} · ${ageOn(app.nascimento)} anos</span>
      <span class="${phoneMaybeTruncated(app) ? 'phone-warning' : ''}">${formatPhone(app.whatsapp)}${phoneMaybeTruncated(app) ? ' · número pode estar incompleto' : ''}</span>
      <small>Recebido em ${formatDateTime(app.criado_em)}</small>
    </button></li>`).join('');
}

async function load() {
  show('loading');
  try {
    applications = await listApplications();
    listError.hidden = true;
    show('list');
    renderList();
  } catch (error) {
    if (error instanceof SessionExpiredError) { showLogin('Sua sessão expirou. Entre de novo.'); return; }
    console.warn('[admin]', error);
    show('list');
    renderList();
    listError.innerHTML = '<strong>Não foi possível carregar os cadastros.</strong> Verifique a internet e toque em Atualizar.';
    listError.hidden = false;
  }
}

function detail(app: Application) {
  const truncated = phoneMaybeTruncated(app);
  const row = (label: string, value: string) => `<dt>${label}</dt><dd>${value}</dd>`;
  const instagram = app.instagram
    ? `<a href="https://instagram.com/${encodeURIComponent(app.instagram)}" target="_blank" rel="noopener noreferrer">@${escapeHtml(app.instagram)}</a>`
    : 'Não tem';
  return `
    <span class="eyebrow">RECEBIDO EM ${formatDateTime(app.criado_em)}</span>
    <h2 id="application-title">${escapeHtml(app.nome)}</h2>
    <div class="application-controls">
      <div class="application-status">
        <label for="application-status">STATUS</label>
        <select id="application-status">
          ${statuses.map(status => `<option value="${status.value}"${status.value === app.status ? ' selected' : ''}>${status.label}</option>`).join('')}
        </select>
      </div>
      <a class="button black" href="${phoneLink(app)}" target="_blank" rel="noopener noreferrer">Conversar no WhatsApp ${icon('message')}</a>
    </div>
    ${truncated ? `<p class="application-warning">Este WhatsApp pode estar incompleto: o cadastro foi feito com +55 antes da correção do formulário, e os 2 últimos números se perderam. Tente os outros telefones.</p>` : ''}
    <section>
      <h3>Dados pessoais</h3>
      <dl>
        ${row('CPF', `${formatCpf(app.cpf)} <button type="button" class="admin-link" data-copy="${formatCpf(app.cpf)}">copiar</button>`)}
        ${row('Nascimento', `${formatIsoDate(app.nascimento)} · ${ageOn(app.nascimento)} anos`)}
        ${row('WhatsApp', `<a href="${phoneLink(app)}" target="_blank" rel="noopener noreferrer">${formatPhone(app.whatsapp)}</a>`)}
        ${row('Outros telefones', app.outros_telefones ? escapeHtml(app.outros_telefones) : 'Não informou')}
        ${row('Instagram', instagram)}
      </dl>
    </section>
    <section>
      <h3>Endereço</h3>
      <dl>
        ${row('Endereço', escapeHtml(app.endereco))}
        ${row('Bairro', escapeHtml(app.bairro))}
        ${row('Cidade', escapeHtml(place(app)))}
        ${row('CEP', formatCep(app.cep))}
        ${row('Ponto de referência', app.referencia ? escapeHtml(app.referencia) : 'Não informou')}
        ${row('Residência', `${app.residencia_tipo === 'propria' ? 'Própria' : 'Alugada'} · ${escapeHtml(app.residencia_tempo)}`)}
      </dl>
    </section>
    <section>
      <h3>Experiência</h3>
      <dl>
        ${row('Já trabalhou com vendas', yesNo(app.ja_vendeu))}
        ${row('Já vendeu consignado', yesNo(app.ja_vendeu_consignado))}
      </dl>
    </section>
    <section>
      <h3>Por que quer ser revendedora</h3>
      <p class="motivation">${escapeHtml(app.motivacao)}</p>
    </section>
    <section>
      <h3>Documentos</h3>
      <div class="application-documents" id="application-documents"><p>Carregando os documentos…</p></div>
    </section>
    <p class="application-meta">Autorizou o uso dos dados em ${formatDateTime(app.consentimento_em)}.<br>Última alteração em ${formatDateTime(app.atualizado_em)}.</p>`;
}

async function loadDocuments(app: Application) {
  const files = [
    ...app.documentos.map((path, index) => ({ path, label: app.documentos.length > 1 ? `Documento com foto ${index + 1}` : 'Documento com foto' })),
    ...app.comprovantes.map(path => ({ path, label: 'Comprovante de residência' })),
  ];
  const target = () => openId === app.id ? document.getElementById('application-documents') : null;
  try {
    const links = await documentLinks(files.map(file => file.path));
    const box = target();
    if (!box) return;
    box.innerHTML = files.map(({ path, label }) => {
      const url = links.get(path);
      if (!url) return `<p>${label}: arquivo não encontrado.</p>`;
      const kind = documentKind(path);
      const preview = kind === 'image'
        ? `<img src="${url}" alt="${label}" loading="lazy">`
        : `<span class="file-tile">${kind === 'pdf' ? 'PDF' : 'FOTO HEIC'}</span>`;
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${preview}${label}</a>`;
    }).join('');
  } catch (error) {
    const box = target();
    if (box) box.innerHTML = '<p>Não foi possível carregar os documentos. Feche e abra o cadastro de novo.</p>';
    if (error instanceof SessionExpiredError) handleError(error, '');
    else console.warn('[admin]', error);
  }
}

function openApplication(id: string) {
  const app = applications.find(item => item.id === id);
  if (!app) return;
  openId = id;
  element('#application-content').innerHTML = detail(app);
  showDialog('application-dialog');
  void loadDocuments(app);
}

// ----- Eventos -----

element<HTMLFormElement>('#admin-login-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const error = element('#admin-login-error');
  const email = element<HTMLInputElement>('#admin-email').value;
  const password = element<HTMLInputElement>('#admin-password').value;
  if (!email || !password) {
    error.textContent = 'Preencha o e-mail e a senha.';
    error.hidden = false;
    return;
  }
  const button = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  button.disabled = true;
  error.hidden = true;
  const message = await signIn(email, password);
  button.disabled = false;
  if (message) {
    error.textContent = message;
    error.hidden = false;
    return;
  }
  form.reset();
  await load();
});

element('#admin-sign-out').addEventListener('click', async () => {
  await signOut();
  applications = [];
  cards.innerHTML = '';
  showLogin();
});

element('#admin-reload').addEventListener('click', () => void load());

document.querySelectorAll<HTMLButtonElement>('[data-status]').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.status as typeof filter;
  document.querySelectorAll('[data-status]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  renderList();
}));

search.addEventListener('input', renderList);

cards.addEventListener('click', event => {
  const card = event.target instanceof Element && event.target.closest<HTMLElement>('[data-id]');
  if (card) openApplication(card.dataset.id!);
});

const dialog = element<HTMLDialogElement>('#application-dialog');
dialog.addEventListener('close', () => {
  // A lista pode ter sido redesenhada (status salvo): volta o foco ao card novo.
  cards.querySelector<HTMLElement>(`[data-id="${openId}"]`)?.focus({ preventScroll: true });
  openId = null;
});

dialog.addEventListener('click', async event => {
  const button = event.target instanceof Element && event.target.closest<HTMLElement>('[data-copy]');
  if (button) toast(await copyText(button.dataset.copy!) ? 'CPF copiado.' : 'Não foi possível copiar.');
});

dialog.addEventListener('change', async event => {
  const select = event.target;
  if (!(select instanceof HTMLSelectElement) || select.id !== 'application-status' || !openId || !isStatus(select.value)) return;
  const index = applications.findIndex(item => item.id === openId);
  const previous = applications[index]!.status;
  select.disabled = true;
  try {
    applications[index] = await updateStatus(openId, select.value);
    renderList();
    toast(`Status salvo: ${statusLabel(select.value)}.`);
  } catch (error) {
    select.value = previous;
    handleError(error, 'Não foi possível salvar o status. Tente de novo.');
  } finally {
    select.disabled = false;
  }
});

if (!adminConfigured) show('not-configured');
else if (hasSession()) void load();
else showLogin();
