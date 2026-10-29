import test from 'node:test';
import assert from 'node:assert/strict';
import {
  documentError, formatCep, formatCpf, formatDate, formatPhone, normalizeInstagram, readRegistration, toIsoDate, validBirthDate, validCep, validCpf, validInstagram,
} from '../src/lib/registration.ts';

test('CPF válido pelos dígitos verificadores', () => {
  for (const cpf of ['529.982.247-25', '52998224725', '111.444.777-35']) assert.equal(validCpf(cpf), true, cpf);
  for (const cpf of ['', '529.982.247-24', '111.111.111-11', '000.000.000-00', '1234567890', '529.982.247-251']) assert.equal(validCpf(cpf), false, cpf);
});

test('máscaras de CPF, CEP e telefone', () => {
  assert.equal(formatCpf('52998224725'), '529.982.247-25');
  assert.equal(formatCpf('5299'), '529.9');
  assert.equal(formatCpf('529.982.247-2599'), '529.982.247-25');
  assert.equal(formatCep('28300000'), '28300-000');
  assert.equal(formatCep('2830'), '2830');
  assert.equal(formatPhone('22999998888'), '(22) 99999-8888');
  assert.equal(formatPhone('2238221234'), '(22) 3822-1234');
  assert.equal(formatPhone('2'), '(2');
  for (const phone of ['+55 (22) 99999-8888', '+55 22 99999-8888', '5522999998888', '+5522999998888', '022999998888', '(22) 99999-8888']) {
    assert.equal(formatPhone(phone), '(22) 99999-8888', phone);
  }
  assert.equal(formatPhone('+55 22 3822-1234'), '(22) 3822-1234');
  // DDD 55 (RS) sem código do país continua valendo.
  assert.equal(formatPhone('55999998888'), '(55) 99999-8888');
  assert.equal(validCep('28300-000'), true);
  assert.equal(validCep('2830-000'), false);
});

test('data de nascimento em dd/mm/aaaa, no passado e plausível', () => {
  const today = new Date(2026, 9, 28);
  assert.equal(formatDate('17051990'), '17/05/1990');
  assert.equal(formatDate('1705'), '17/05');
  assert.equal(formatDate('170'), '17/0');
  assert.equal(toIsoDate('17/05/1990'), '1990-05-17');
  assert.equal(toIsoDate('31/02/1990'), '');
  assert.equal(validBirthDate('17/05/1990', today), true);
  assert.equal(validBirthDate('29/02/2000', today), true);
  assert.equal(validBirthDate('01/01/2030', today), false);
  assert.equal(validBirthDate('01/01/1890', today), false);
  assert.equal(validBirthDate('31/02/1990', today), false);
  assert.equal(validBirthDate('1990-05-17', today), false);
  assert.equal(validBirthDate('', today), false);
});

test('documentos aceitam foto ou PDF até 10 MB', () => {
  assert.equal(documentError({ name: 'rg.jpg', type: 'image/jpeg', size: 2e6 }), '');
  assert.equal(documentError({ name: 'conta.pdf', type: 'application/pdf', size: 1e6 }), '');
  assert.equal(documentError({ name: 'IMG_0001.HEIC', type: '', size: 3e6 }), '');
  assert.match(documentError({ name: 'video.mp4', type: 'video/mp4', size: 1e6 }), /não é foto nem PDF/);
  assert.match(documentError({ name: 'rg.jpg', type: 'image/jpeg', size: 11 * 1024 * 1024 }), /mais de 10 MB/);
});

test('instagram sem @ nem endereço completo', () => {
  assert.equal(normalizeInstagram('@@maria.semijoias'), 'maria.semijoias');
  assert.equal(normalizeInstagram('https://www.instagram.com/maria.semijoias/'), 'maria.semijoias');
  assert.equal(validInstagram('@maria.semijoias'), true);
  assert.equal(validInstagram('maria semijoias'), false);
  assert.equal(validInstagram('@'), false);
  assert.equal(validInstagram('a'.repeat(31)), false);
});

test('leitura do formulário normaliza os campos', () => {
  const fields = new Map<string, string>([
    ['nome', '  Ana   Maria  Souza '], ['cpf', '529.982.247-25'], ['nascimento', '17/05/1990'], ['whatsapp', '(22) 99999-8888'], ['cep', '28300-000'],
    ['residencia_tipo', 'alugada'], ['ja_vendeu', 'sim'], ['ja_vendeu_consignado', 'nao'],
    ['tem_instagram', 'nao'], ['instagram', '@ignorado'], ['consentimento', 'sim'],
  ]);
  const data = readRegistration(fields);
  assert.equal(data.nome, 'Ana Maria Souza');
  assert.equal(data.cpf, '52998224725');
  assert.equal(data.nascimento, '1990-05-17');
  assert.equal(data.whatsapp, '22999998888');
  assert.equal(data.cep, '28300000');
  assert.equal(data.residenciaTipo, 'alugada');
  assert.equal(data.jaVendeu, true);
  assert.equal(data.jaVendeuConsignado, false);
  assert.equal(data.instagram, '');
  assert.equal(data.consentimento, true);
});
