// Login e leitura dos cadastros para a página /admin.
//
// Mesmo desenho do /admin do Qüem Qüem: Supabase Auth direto por fetch, sem
// supabase-js. A publishable key sozinha NÃO lê nada: as policies da migração
// apfolheados_cadastros exigem a sessão de alguém que esteja em
// apfolheados.admins. Quem só estiver logado (ex.: admin de outro cliente do
// projeto) recebe zero linhas, por isso o login confere e_admin().
//
// O admin pode ler os cadastros e os documentos e mudar só o status (grant por
// coluna). O token da sessão fica em localStorage, como o supabase-js faria.

import type { Application, ApplicationStatus } from './applications';
import { BUCKET, KEY, SCHEMA, URL_BASE, supabaseConfigured } from './supabase';

const SESSION_KEY = 'ap.admin.session';
/** Validade dos links dos documentos. */
const LINK_SECONDS = 60 * 60;

export const adminConfigured = supabaseConfigured;

interface Session { access_token: string; refresh_token: string; expires_at: number }

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as Session : null;
  } catch {
    return null;
  }
}

function writeSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* Sem localStorage a sessão dura só esta aba. */ }
}

function keep(data: { access_token: string; refresh_token: string; expires_in?: number }): Session {
  const session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    // margem de 60s para não usar um token que expira no meio da chamada
    expires_at: Date.now() + (Number(data.expires_in ?? 3600) - 60) * 1000,
  };
  writeSession(session);
  return session;
}

export const hasSession = () => Boolean(readSession());

export class SessionExpiredError extends Error {}
export class NotAdminError extends Error {}

async function authRequest(grant: 'password' | 'refresh_token', body: object) {
  return fetch(`${URL_BASE}/auth/v1/token?grant_type=${grant}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: KEY },
    body: JSON.stringify(body),
  });
}

/** Token válido, renovando se já expirou. Null quando a sessão acabou. */
async function accessToken() {
  let session = readSession();
  if (!session) return null;
  if (Date.now() >= session.expires_at) {
    const response = await authRequest('refresh_token', { refresh_token: session.refresh_token }).catch(() => null);
    session = response?.ok ? keep(await response.json()) : null;
    if (!session) writeSession(null);
  }
  return session?.access_token ?? null;
}

async function request(path: string, init: RequestInit = {}) {
  const token = await accessToken();
  if (!token) throw new SessionExpiredError();
  const response = await fetch(`${URL_BASE}${path}`, {
    ...init,
    headers: { apikey: KEY, Authorization: `Bearer ${token}`, ...init.headers },
  });
  if (response.status === 401) {
    writeSession(null);
    throw new SessionExpiredError();
  }
  if (!response.ok) throw new Error(`Falha na consulta (${response.status}): ${await response.text().catch(() => '')}`);
  return response;
}

const isAdmin = async () => await (await request('/rest/v1/rpc/e_admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Profile': SCHEMA },
  body: '{}',
})).json() === true;

/** Faz login. Devolve a mensagem de erro, ou null se deu certo. */
export async function signIn(email: string, password: string): Promise<string | null> {
  try {
    const response = await authRequest('password', { email: email.trim(), password });
    if (!response.ok) {
      return response.status === 400 ? 'E-mail ou senha incorretos.' : `Não foi possível entrar agora (${response.status}).`;
    }
    keep(await response.json());
    if (!await isAdmin()) {
      await signOut();
      return 'Este usuário não tem acesso aos cadastros da AP.';
    }
    return null;
  } catch {
    return 'Sem conexão. Verifique a internet e tente de novo.';
  }
}

export async function signOut() {
  const token = readSession()?.access_token;
  writeSession(null);
  if (token) {
    await fetch(`${URL_BASE}/auth/v1/logout`, { method: 'POST', headers: { apikey: KEY, Authorization: `Bearer ${token}` } }).catch(() => {});
  }
}

/** Todos os cadastros, mais recentes primeiro. */
export async function listApplications(): Promise<Application[]> {
  const response = await request('/rest/v1/cadastros?select=*&order=criado_em.desc', { headers: { 'Accept-Profile': SCHEMA } });
  return await response.json() as Application[];
}

export async function updateStatus(id: string, status: ApplicationStatus): Promise<Application> {
  const response = await request(`/rest/v1/cadastros?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Content-Profile': SCHEMA,
      Accept: 'application/vnd.pgrst.object+json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ status, atualizado_em: new Date().toISOString() }),
  });
  return await response.json() as Application;
}

/** Links temporários (1 hora) para os documentos do bucket privado. */
export async function documentLinks(paths: string[]): Promise<Map<string, string>> {
  if (!paths.length) return new Map();
  const response = await request(`/storage/v1/object/sign/${BUCKET}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn: LINK_SECONDS, paths }),
  });
  const items = await response.json() as { path: string; signedURL: string | null; error: string | null }[];
  return new Map(items.filter(item => item.signedURL).map(item => [item.path, `${URL_BASE}/storage/v1${item.signedURL}`]));
}
