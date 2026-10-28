// Envio do cadastro de revendedora (/cadastro) para o Supabase: projeto
// mechanicalmen-platform, schema "apfolheados" e bucket privado de documentos.
// A migração está em mechanicalmen-platform/supabase/migrations/*_apfolheados_cadastros.sql.
//
// Mesmo padrão do site do Qüem Qüem: chamada direta à API, sem supabase-js.
// O header `Content-Profile` seleciona o schema do cliente. A publishable key
// (sb_publishable_…) não é um JWT, então vai só no header `apikey` e resolve
// para o papel `anon`, que só pode ENVIAR arquivos e chamar registrar_cadastro().
//
// Precisa de PUBLIC_SUPABASE_URL e PUBLIC_SUPABASE_PUBLISHABLE_KEY (ver .env.example).
// Sem elas o formulário valida, mas avisa que o envio ainda não está ligado.

import type { Registration } from './registration';

const URL_BASE = (import.meta.env.PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
const KEY = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
const SCHEMA = 'apfolheados';
const BUCKET = 'apfolheados-documentos';

export const supabaseConfigured = Boolean(URL_BASE && KEY);

export type DocumentKind = 'documento' | 'comprovante';

/** cadastros/<id>/<tipo>-<n>-<aleatório>.<ext>: a policy do bucket só aceita essa pasta. */
export function documentPath(id: string, kind: DocumentKind, index: number, file: { name: string }) {
  const ext = (/\.([a-z0-9]{2,5})$/i.exec(file.name)?.[1] ?? 'jpg').toLowerCase();
  const suffix = Math.random().toString(36).slice(2, 8);
  return `cadastros/${id}/${kind}-${index + 1}-${suffix}.${ext}`;
}

// Alguns navegadores mandam foto HEIC (iPhone) sem tipo.
const contentType = (file: File) => file.type
  || (/\.heic$/i.test(file.name) ? 'image/heic' : /\.heif$/i.test(file.name) ? 'image/heif' : 'application/octet-stream');

export async function uploadDocument(path: string, file: File) {
  const response = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': contentType(file), 'x-upsert': 'false' },
    body: file,
  });
  if (!response.ok) throw new Error(`Envio do documento recusado (${response.status}): ${await response.text().catch(() => '')}`);
}

export async function registerApplication(id: string, data: Registration, paths: Record<DocumentKind, string[]>) {
  const response = await fetch(`${URL_BASE}/rest/v1/rpc/registrar_cadastro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Profile': SCHEMA,
      apikey: KEY,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      p_id: id,
      p_nome: data.nome,
      p_cpf: data.cpf,
      p_nascimento: data.nascimento,
      p_whatsapp: data.whatsapp,
      p_outros_telefones: data.outrosTelefones,
      p_cep: data.cep,
      p_endereco: data.endereco,
      p_bairro: data.bairro,
      p_cidade: data.cidade,
      p_uf: data.uf,
      p_referencia: data.referencia,
      p_residencia_tipo: data.residenciaTipo,
      p_residencia_tempo: data.residenciaTempo,
      p_ja_vendeu: data.jaVendeu,
      p_ja_vendeu_consignado: data.jaVendeuConsignado,
      p_instagram: data.instagram,
      p_motivacao: data.motivacao,
      p_documentos: paths.documento,
      p_comprovantes: paths.comprovante,
      p_consentimento: data.consentimento,
    }),
    // sobrevive ao fechamento da aba logo depois do envio
    keepalive: true,
  });
  if (!response.ok) throw new Error(`Cadastro recusado (${response.status}): ${await response.text().catch(() => '')}`);
}
