import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ageOn, countByStatus, documentKind, formatDateTime, formatIsoDate, phoneMaybeTruncated, searchApplications, type Application,
} from '../src/lib/applications.ts';

const base: Application = {
  id: '1', nome: 'Ana Maria Souza', cpf: '52998224725', nascimento: '1990-05-17', whatsapp: '22999998888', outros_telefones: null,
  cep: '28300000', endereco: 'Rua A, 10', bairro: 'Centro', cidade: 'Itaperuna', uf: 'RJ', referencia: null,
  residencia_tipo: 'propria', residencia_tempo: 'De 1 a 3 anos', ja_vendeu: true, ja_vendeu_consignado: false, instagram: null,
  motivacao: 'Quero ter uma renda extra.', documentos: [], comprovantes: [], consentimento_em: '2026-10-28T17:05:00Z',
  status: 'novo', criado_em: '2026-10-28T17:05:00Z', atualizado_em: '2026-10-28T17:05:00Z',
};
const list: Application[] = [
  base,
  { ...base, id: '2', nome: 'Bia Lima', cidade: 'Bom Jesus do Itabapoana', bairro: 'São José', cpf: '11144477735', whatsapp: '22988887777', status: 'aprovado' },
  { ...base, id: '3', nome: 'Célia Araújo', cidade: 'Natividade', cpf: '39053344705', whatsapp: '22977776666', outros_telefones: '(22) 3822-1234', status: 'reprovado' },
];

test('idade completa conforme o aniversário', () => {
  assert.equal(ageOn('1990-05-17', new Date(2026, 4, 16)), 35);
  assert.equal(ageOn('1990-05-17', new Date(2026, 4, 17)), 36);
  assert.equal(ageOn('2000-12-31', new Date(2026, 9, 29)), 25);
});

test('datas em formato brasileiro e horário de Brasília', () => {
  assert.equal(formatIsoDate('1990-05-17'), '17/05/1990');
  assert.equal(formatDateTime('2026-10-28T17:05:00Z'), '28/10/2026 às 14:05');
  // 01:30 UTC ainda é o dia anterior em Brasília.
  assert.equal(formatDateTime('2026-10-29T01:30:00Z'), '28/10/2026 às 22:30');
});

test('busca por nome sem acento, cidade, CPF e telefone', () => {
  const ids = (query: string, status: Parameters<typeof searchApplications>[2] = 'todos') => searchApplications(list, query, status).map(app => app.id);
  assert.deepEqual(ids(''), ['1', '2', '3']);
  assert.deepEqual(ids('celia'), ['3']);
  assert.deepEqual(ids('sao jose'), ['2']);
  assert.deepEqual(ids('itaperuna'), ['1']);
  assert.deepEqual(ids('111.444'), ['2']);
  assert.deepEqual(ids('98888-7777'), ['2']);
  assert.deepEqual(ids('3822'), ['3']);
  assert.deepEqual(ids('', 'aprovado'), ['2']);
  assert.deepEqual(ids('celia', 'aprovado'), []);
  // Poucos números não filtram por CPF (evita "2" achar todo mundo).
  assert.deepEqual(ids('22'), []);
});

test('contagem por status', () => {
  assert.deepEqual(countByStatus(list), { todos: 3, novo: 1, em_analise: 0, aprovado: 1, reprovado: 1 });
});

test('WhatsApp possivelmente cortado pelo +55', () => {
  assert.equal(phoneMaybeTruncated({ whatsapp: '55229999988', uf: 'RJ' }), true);
  assert.equal(phoneMaybeTruncated({ whatsapp: '55999998888', uf: 'RS' }), false);
  assert.equal(phoneMaybeTruncated({ whatsapp: '22999998888', uf: 'RJ' }), false);
});

test('tipo de documento pela extensão', () => {
  assert.equal(documentKind('cadastros/x/documento-1-abc.JPG'), 'image');
  assert.equal(documentKind('cadastros/x/comprovante-1-abc.pdf'), 'pdf');
  assert.equal(documentKind('cadastros/x/documento-2-abc.heic'), 'other');
});
