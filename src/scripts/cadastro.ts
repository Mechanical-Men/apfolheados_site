import { brand } from '../config/brand';
import { faqMessage, validPhone, whatsappUrl } from '../lib/catalog';
import {
  RESPONSE_DAYS, documentError, formatBytes, formatCep, formatCpf, formatDate, formatPhone, readRegistration, validBirthDate,
  validCep, validCpf, validInstagram, type Registration,
} from '../lib/registration';
import {
  CpfAlreadyRegisteredError, canRegister, documentPath, registerApplication, supabaseConfigured, uploadDocument, type DocumentKind,
} from '../lib/supabase';
import { element, escapeHtml, icon, showDialog } from './shell';

// Página /cadastro: máscaras, busca de CEP, documentos e validação do cadastro de revendedora.

interface RegistrationFiles { documento: File[]; comprovante: File[] }

// Um id por cadastro: tentar de novo depois de um erro atualiza a mesma linha
// no banco e não reenvia os arquivos que já tinham subido.
let applicationId = crypto.randomUUID();
const uploaded = new Map<File, string>();

/** Envia os documentos ao bucket privado e depois grava o cadastro (ver src/lib/supabase.ts). */
async function submitRegistration(data: Registration, files: RegistrationFiles): Promise<'sent' | 'not-configured'> {
  if (!supabaseConfigured) return 'not-configured';
  if (uploaded.size === 0) {
    showStatus('info', '<strong>Conferindo o CPF…</strong> Não feche esta página.');
    if (!await canRegister(applicationId, data.cpf)) throw new CpfAlreadyRegisteredError();
  }
  const paths: Record<DocumentKind, string[]> = { documento: [], comprovante: [] };
  const queue = (['documento', 'comprovante'] as const).flatMap(kind => files[kind].map((file, index) => ({ kind, file, index })));
  for (const [position, { kind, file, index }] of queue.entries()) {
    let path = uploaded.get(file);
    if (!path) {
      showStatus('info', `<strong>Enviando os documentos…</strong> ${position + 1} de ${queue.length}. Não feche esta página.`);
      path = documentPath(applicationId, kind, index, file);
      await uploadDocument(path, file);
      uploaded.set(file, path);
    }
    paths[kind].push(path);
  }
  showStatus('info', '<strong>Enviando o cadastro…</strong> Não feche esta página.');
  await registerApplication(applicationId, data, paths);
  applicationId = crypto.randomUUID();
  uploaded.clear();
  return 'sent';
}

const form = element<HTMLFormElement>('#registration-form');
const submit = element<HTMLButtonElement>('#registration-form button[type="submit"]');
const status = element('#registration-status');
const input = <T extends HTMLElement = HTMLInputElement>(name: string) => element<T>(`#registration-form [name="${name}"]`);

// Máscaras enquanto digita.
const masks: [string, (value: string) => string][] = [['cpf', formatCpf], ['nascimento', formatDate], ['cep', formatCep], ['whatsapp', formatPhone]];
for (const [name, format] of masks) {
  const field = input(name);
  field.addEventListener('input', () => { field.value = format(field.value); });
}

// Mensagens de cada campo além das regras nativas (required, minlength...).
const customRules: Partial<Record<string, (value: string) => string>> = {
  cpf: value => validCpf(value) ? '' : 'Confira o CPF: os números não batem.',
  whatsapp: value => validPhone(value) ? '' : 'Informe um WhatsApp com DDD.',
  nascimento: value => validBirthDate(value) ? '' : value.length < 10
    ? 'Informe a data no formato dia/mês/ano, como 17/05/1990.'
    : 'Confira a data: esse dia não existe ou ainda não chegou.',
  cep: value => validCep(value) ? '' : 'O CEP tem 8 números.',
  instagram: value => validInstagram(value) ? '' : 'Use só letras, números, ponto e sublinhado, como @maria.semijoias.',
};

const nativeMessage = (field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => {
  const v = field.validity;
  if (v.valueMissing) {
    if (field.type === 'radio') return 'Escolha uma opção.';
    if (field.type === 'checkbox') return 'Para enviar, marque a autorização.';
    if (field.type === 'file') return 'Envie o arquivo.';
    return field instanceof HTMLSelectElement ? 'Selecione uma opção.' : 'Preencha este campo.';
  }
  if (v.tooShort) return `Escreva pelo menos ${field.getAttribute('minlength')} caracteres.`;
  return field.validationMessage;
};

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const errorFor = (field: Field) => {
  const group = field.type === 'radio' ? field.closest('fieldset') : field;
  const id = group?.getAttribute('aria-describedby')?.split(' ').find(item => item.endsWith('-error'));
  return id ? document.getElementById(id) : null;
};

function validate(field: Field, show: boolean) {
  const rule = customRules[field.name];
  // Vazio cai na regra nativa ("Preencha este campo"), não na mensagem de formato.
  field.setCustomValidity(rule && field.value ? rule(field.value) : '');
  const valid = field.checkValidity();
  if (!show && !valid) return valid;
  const error = errorFor(field);
  const target = field.type === 'radio' ? field.closest('fieldset')! : field;
  if (valid) target.removeAttribute('aria-invalid'); else target.setAttribute('aria-invalid', 'true');
  if (error) {
    error.textContent = valid ? '' : nativeMessage(field);
    error.hidden = valid;
  }
  return valid;
}

const fields = () => [...form.querySelectorAll<Field>('input,select,textarea')].filter(field => !field.closest('[hidden]') && field.name);

// Corrige o erro enquanto a pessoa ajusta; só mostra erro novo ao sair do campo.
form.addEventListener('input', event => {
  const field = event.target as Field;
  if (field.getAttribute('aria-invalid') === 'true' || field.closest('[aria-invalid="true"]')) validate(field, true);
});
form.addEventListener('focusout', event => {
  const field = event.target as Field;
  if (field.matches?.('input:not([type=radio]):not([type=checkbox]):not([type=file]),select,textarea') && field.value) validate(field, true);
});
form.addEventListener('change', event => {
  const field = event.target as Field;
  if (field.type === 'radio' || field.type === 'checkbox' || field instanceof HTMLSelectElement) validate(field, true);
});

// Instagram: o @ só é pedido para quem respondeu "Sim".
const instagramField = element('#reg-instagram-field');
const instagram = input('instagram');
form.querySelectorAll<HTMLInputElement>('[name="tem_instagram"]').forEach(radio => radio.addEventListener('change', () => {
  const show = radio.value === 'sim' && radio.checked;
  instagramField.hidden = !show;
  instagram.required = show;
  if (show) instagram.focus();
}));

// CEP: completa endereço, bairro, cidade e UF pelo ViaCEP (serviço público dos Correios).
const cep = input('cep');
const cepHint = element('#reg-cep-hint');
let lastCep = '';
cep.addEventListener('input', async () => {
  const digits = cep.value.replace(/\D/g, '');
  if (digits.length !== 8 || digits === lastCep) return;
  lastCep = digits;
  cepHint.textContent = 'Buscando o endereço…';
  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    const data = await response.json() as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string };
    if (data.erro) throw new Error('not found');
    const fill = (name: string, value = '') => { const field = input<HTMLInputElement | HTMLSelectElement>(name); if (value && !field.value) { field.value = value; validate(field, true); } };
    fill('endereco', data.logradouro ? `${data.logradouro}, ` : '');
    fill('bairro', data.bairro);
    fill('cidade', data.localidade);
    fill('uf', data.uf);
    // CEP geral de cidade (ex.: 28300-000) não tem rua nem bairro.
    cepHint.textContent = data.logradouro ? 'Endereço encontrado. Complete com o número da casa.' : 'Encontramos a cidade. Preencha a rua, o número e o bairro.';
    const endereco = input('endereco');
    if (document.activeElement === cep && endereco.value.endsWith(', ')) endereco.focus();
  } catch {
    cepHint.textContent = 'Não encontramos esse CEP. Preencha o endereço abaixo.';
  }
});

// Contador do texto de motivação.
const motivation = input<HTMLTextAreaElement>('motivacao');
const counter = element('#reg-motivacao-count');
motivation.addEventListener('input', () => { counter.textContent = `${motivation.value.length} / 1500`; });

// Documentos: lista com miniatura, remoção e limite de arquivos por campo.
const selected: RegistrationFiles = { documento: [], comprovante: [] };
const previews = new Map<File, string>();

function syncFiles(name: keyof RegistrationFiles) {
  const fileInput = input(name);
  const transfer = new DataTransfer();
  selected[name].forEach(file => transfer.items.add(file));
  fileInput.files = transfer.files;
  const list = element(`#reg-${name}-list`);
  list.innerHTML = selected[name].map((file, index) => {
    const isImage = file.type.startsWith('image/') && !/heic|heif/i.test(file.type);
    if (isImage && !previews.has(file)) previews.set(file, URL.createObjectURL(file));
    const thumb = isImage ? `<img src="${previews.get(file)}" alt="" width="48" height="48">` : `<span class="file-badge">${/pdf/i.test(file.type) ? 'PDF' : 'FOTO'}</span>`;
    return `<li>${thumb}<span class="file-name">${escapeHtml(file.name)}<small>${formatBytes(file.size)}</small></span><button type="button" data-remove-file="${name}" data-index="${index}" aria-label="Remover ${escapeHtml(file.name)}">${icon('close')}</button></li>`;
  }).join('');
  const max = Number(fileInput.closest<HTMLElement>('.file-field')!.dataset.maxFiles);
  fileInput.closest('.file-field')!.querySelector('.file-drop')!.toggleAttribute('hidden', selected[name].length >= max);
}

for (const name of ['documento', 'comprovante'] as const) {
  const fileInput = input(name);
  const max = Number(fileInput.closest<HTMLElement>('.file-field')!.dataset.maxFiles);
  fileInput.addEventListener('change', () => {
    const incoming = [...(fileInput.files ?? [])].filter(file => !selected[name].includes(file));
    const problems = incoming.map(documentError).filter(Boolean);
    const combined = [...selected[name], ...incoming.filter(file => !documentError(file))];
    if (combined.length > max) problems.push(max === 1 ? 'Envie só 1 arquivo.' : `Envie no máximo ${max} arquivos.`);
    selected[name] = combined.slice(0, max);
    syncFiles(name);
    const error = element(`#reg-${name}-error`);
    error.textContent = problems.join(' ');
    error.hidden = problems.length === 0;
    if (problems.length) fileInput.setAttribute('aria-invalid', 'true'); else fileInput.removeAttribute('aria-invalid');
  });
}

form.addEventListener('click', event => {
  const button = event.target instanceof Element && event.target.closest<HTMLButtonElement>('[data-remove-file]');
  if (!button) return;
  const name = button.dataset.removeFile as keyof RegistrationFiles;
  const [removed] = selected[name].splice(Number(button.dataset.index), 1);
  if (removed && previews.has(removed)) { URL.revokeObjectURL(previews.get(removed)!); previews.delete(removed); }
  syncFiles(name);
  input(name).focus();
});

function showSuccess(whatsapp: string) {
  element('#resource-title').textContent = 'Cadastro enviado!';
  element('#resource-content').innerHTML = `
    <p>Recebemos os seus dados e documentos. A equipe da AP tem um prazo de até ${RESPONSE_DAYS} dias para analisar o seu cadastro e dar o retorno.</p>
    <p>O retorno será dado pelo WhatsApp informado no cadastro: <strong class="phone">${escapeHtml(whatsapp)}</strong>. Fique de olho nas mensagens.</p>
    <a class="button black" href="/">Voltar para o site ${icon('arrow')}</a>`;
  showDialog('resource-dialog');
}

function showCpfAlreadyRegistered() {
  const cpfField = input('cpf');
  const error = errorFor(cpfField)!;
  cpfField.setAttribute('aria-invalid', 'true');
  error.textContent = 'Este CPF já tem um cadastro na AP.';
  error.hidden = false;
  showStatus('error', '<strong>Cadastro não enviado.</strong> Este CPF já tem um cadastro na AP.');
  element('#resource-title').textContent = 'Este CPF já tem cadastro.';
  element('#resource-content').innerHTML = `
    <p>Já recebemos um cadastro com este CPF, e cada CPF pode fazer só 1 cadastro. Por isso, este não foi enviado.</p>
    <p>A resposta do cadastro anterior chega pelo WhatsApp informado nele, em até ${RESPONSE_DAYS} dias. Se precisar corrigir algum dado ou tiver dúvidas, fale com a AP pelo WhatsApp <strong class="phone">${brand.whatsappDisplay}</strong>.</p>
    <a class="button black" href="${whatsappUrl(faqMessage, brand.whatsapp)}" target="_blank" rel="noopener noreferrer">Falar com a AP ${icon('message')}</a>`;
  showDialog('resource-dialog');
}

function showStatus(kind: 'error' | 'info' | 'success', html: string) {
  status.className = `form-status is-${kind}`;
  status.innerHTML = html;
  status.hidden = false;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const invalid = fields().filter(field => !validate(field, true));
  if (invalid.length) {
    const missing = new Set(invalid.map(field => field.name)).size;
    showStatus('error', `<strong>${missing === 1 ? 'Falta 1 campo' : `Faltam ${missing} campos`}.</strong> Confira os itens marcados acima.`);
    invalid[0]!.focus();
    return;
  }
  submit.disabled = true;
  status.hidden = true;
  try {
    const data = readRegistration(new FormData(form));
    const result = await submitRegistration(data, selected);
    if (result === 'not-configured') {
      showStatus('info', '<strong>Tudo certo com o preenchimento.</strong> Este formulário ainda está em teste: o envio para a AP será ligado em breve, então os dados não foram enviados.');
    } else {
      form.reset();
      selected.documento = []; selected.comprovante = [];
      syncFiles('documento'); syncFiles('comprovante');
      instagramField.hidden = true;
      instagram.required = false;
      counter.textContent = '0 / 1500';
      showStatus('success', `<strong>Cadastro enviado!</strong> A AP dá o retorno em até ${RESPONSE_DAYS} dias, pelo WhatsApp informado.`);
      showSuccess(formatPhone(data.whatsapp));
    }
  } catch (error) {
    if (error instanceof CpfAlreadyRegisteredError) showCpfAlreadyRegistered();
    else {
      console.warn('[cadastro] Envio falhou:', error);
      showStatus('error', '<strong>Não foi possível enviar agora.</strong> Verifique a sua internet e tente de novo. Os dados preenchidos continuam aqui.');
    }
  } finally {
    submit.disabled = false;
    // Com o pop-up aberto o foco fica nele.
    if (!document.querySelector('dialog[open]')) status.focus();
  }
});

// Só libera o envio depois que o JavaScript do formulário carregou.
submit.disabled = false;
