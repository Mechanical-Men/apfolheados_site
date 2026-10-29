// Cadastros de revendedora como o /admin recebe do banco (tabela apfolheados.cadastros)
// e as regras puras da lista: busca, contagem por status, idade e datas.

export type ApplicationStatus = 'novo' | 'em_analise' | 'aprovado' | 'reprovado';

export const statuses: { value: ApplicationStatus; label: string }[] = [
  { value: 'novo', label: 'Novo' },
  { value: 'em_analise', label: 'Em análise' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'reprovado', label: 'Reprovado' },
];

export const isStatus = (value: string): value is ApplicationStatus => statuses.some(status => status.value === value);
export const statusLabel = (value: ApplicationStatus) => statuses.find(status => status.value === value)?.label ?? value;

export interface Application {
  id: string;
  nome: string;
  cpf: string;
  /** aaaa-mm-dd */
  nascimento: string;
  whatsapp: string;
  outros_telefones: string | null;
  cep: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  referencia: string | null;
  residencia_tipo: 'propria' | 'alugada';
  residencia_tempo: string;
  ja_vendeu: boolean;
  ja_vendeu_consignado: boolean;
  instagram: string | null;
  motivacao: string;
  documentos: string[];
  comprovantes: string[];
  consentimento_em: string;
  status: ApplicationStatus;
  criado_em: string;
  atualizado_em: string;
}

/** Idade completa na data de hoje, a partir de aaaa-mm-dd. */
export function ageOn(birth: string, today = new Date()) {
  const [year, month, day] = birth.split('-').map(Number) as [number, number, number];
  const age = today.getFullYear() - year;
  const beforeBirthday = today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day);
  return beforeBirthday ? age - 1 : age;
}

/** aaaa-mm-dd → dd/mm/aaaa, sem passar por Date (que mudaria o dia pelo fuso). */
export const formatIsoDate = (iso: string) => iso.split('-').reverse().join('/');

/** Data e hora no horário de Brasília, como 28/10/2026 às 14:05. */
export function formatDateTime(iso: string) {
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value ?? '';
  return `${part('day')}/${part('month')}/${part('year')} às ${part('hour')}:${part('minute')}`;
}

const plain = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** Filtra por status e por nome, cidade, bairro, CPF ou telefone (sem acento e sem máscara). */
export function searchApplications(list: Application[], query: string, status: ApplicationStatus | 'todos') {
  const text = plain(query.trim());
  const digits = query.replace(/\D/g, '');
  return list.filter(app => {
    if (status !== 'todos' && app.status !== status) return false;
    if (!text) return true;
    if (plain(`${app.nome} ${app.cidade} ${app.bairro}`).includes(text)) return true;
    return digits.length >= 3 && [app.cpf, app.whatsapp, app.outros_telefones ?? ''].some(value => value.replace(/\D/g, '').includes(digits));
  });
}

export function countByStatus(list: Application[]) {
  const counts: Record<ApplicationStatus | 'todos', number> = { todos: list.length, novo: 0, em_analise: 0, aprovado: 0, reprovado: 0 };
  for (const app of list) counts[app.status] += 1;
  return counts;
}

/**
 * Antes da correção do +55 no formulário, "+55 22 99999-8888" era gravado como 55229999988:
 * o 55 virava DDD e os 2 últimos números se perdiam. DDD 55 só existe no RS.
 */
export const phoneMaybeTruncated = (app: Pick<Application, 'whatsapp' | 'uf'>) => app.whatsapp.startsWith('55') && app.uf !== 'RS';

/** Como mostrar o arquivo: foto que o navegador abre, PDF, ou só o link (HEIC do iPhone). */
export function documentKind(path: string): 'image' | 'pdf' | 'other' {
  const ext = /\.([a-z0-9]+)$/i.exec(path)?.[1]?.toLowerCase() ?? '';
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return 'image';
  return ext === 'pdf' ? 'pdf' : 'other';
}
