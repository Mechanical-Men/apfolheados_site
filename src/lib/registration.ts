/** Regras e formatos do cadastro de revendedoras (/cadastro). Sem dependência do navegador. */

const digits = (value: string) => value.replace(/\D/g, '');

/** CPF válido pelos dígitos verificadores. Rejeita sequências repetidas (111.111.111-11). */
export function validCpf(value: string) {
  const d = digits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const check = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) sum += Number(d[i]) * (length + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return check(9) === Number(d[9]) && check(10) === Number(d[10]);
}

export const validCep = (value: string) => digits(value).length === 8;

/** Máscaras aplicadas enquanto a pessoa digita. */
export function formatCpf(value: string) {
  const d = digits(value).slice(0, 11);
  return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

export function formatCep(value: string) {
  const d = digits(value).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function formatPhone(value: string) {
  const d = digits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  const local = d.slice(2);
  const split = local.length > 8 ? 5 : 4;
  return `(${d.slice(0, 2)}) ${local.length > split ? `${local.slice(0, split)}-${local.slice(split)}` : local}`;
}

/** Data no formato brasileiro (dd/mm/aaaa), digitada com máscara. */
export function formatDate(value: string) {
  const d = digits(value).slice(0, 8);
  return d.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
}

/** dd/mm/aaaa → AAAA-MM-DD (formato do banco). Vazio se a data não existir. */
export function toIsoDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return '';
  const [, day, month, year] = match.map(Number) as [number, number, number, number];
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return '';
  return `${match[3]}-${match[2]}-${match[1]}`;
}

/** Data de nascimento (dd/mm/aaaa) existente, no passado e com ano plausível. */
export function validBirthDate(value: string, today = new Date()) {
  const iso = toIsoDate(value);
  if (!iso) return false;
  const [year, month, day] = iso.split('-').map(Number) as [number, number, number];
  return year >= 1900 && new Date(year, month - 1, day) < today;
}

/** Mesmo formato aceito pelo banco: letras, números, ponto e sublinhado, até 30. */
export const validInstagram = (value: string) => /^[A-Za-z0-9._]{1,30}$/.test(normalizeInstagram(value));

export const normalizeInstagram = (value: string) => value.trim().replace(/^@+/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/.*$/, '');

export const states = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

/** Arquivos aceitos nos documentos: fotos do celular ou PDF, até 10 MB cada. */
export const DOCUMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf'] as const;
export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

export function documentError(file: { name: string; type: string; size: number }) {
  const heic = /\.(heic|heif)$/i.test(file.name);
  if (!DOCUMENT_TYPES.includes(file.type as typeof DOCUMENT_TYPES[number]) && !heic) return `"${file.name}" não é foto nem PDF.`;
  if (file.size > DOCUMENT_MAX_BYTES) return `"${file.name}" tem mais de 10 MB.`;
  return '';
}

export const formatBytes = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;

/** Dados do cadastro, no formato que será gravado no banco (Supabase). */
export interface Registration {
  nome: string;
  cpf: string;
  nascimento: string;
  whatsapp: string;
  outrosTelefones: string;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  referencia: string;
  residenciaTipo: 'propria' | 'alugada';
  residenciaTempo: string;
  jaVendeu: boolean;
  jaVendeuConsignado: boolean;
  instagram: string;
  motivacao: string;
  consentimento: boolean;
}

/** Converte os campos do formulário. Os arquivos (documento e comprovante) vão à parte. */
export function readRegistration(fields: { get(name: string): unknown }): Registration {
  const text = (name: string) => String(fields.get(name) ?? '').trim();
  return {
    nome: text('nome').replace(/\s+/g, ' '),
    cpf: digits(text('cpf')),
    nascimento: toIsoDate(text('nascimento')),
    whatsapp: digits(text('whatsapp')),
    outrosTelefones: text('outros_telefones'),
    cep: digits(text('cep')),
    endereco: text('endereco'),
    bairro: text('bairro'),
    cidade: text('cidade'),
    uf: text('uf'),
    referencia: text('referencia'),
    residenciaTipo: text('residencia_tipo') === 'alugada' ? 'alugada' : 'propria',
    residenciaTempo: text('residencia_tempo'),
    jaVendeu: text('ja_vendeu') === 'sim',
    jaVendeuConsignado: text('ja_vendeu_consignado') === 'sim',
    instagram: text('tem_instagram') === 'sim' ? normalizeInstagram(text('instagram')) : '',
    motivacao: text('motivacao'),
    consentimento: text('consentimento') === 'sim',
  };
}
