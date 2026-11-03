import { test } from 'node:test';
import assert from 'node:assert/strict';
import Cliente from '../src/models/Cliente.js';
import Veiculo from '../src/models/Veiculo.js';
import CadastroService, { RegraDeNegocioError } from '../src/services/CadastroService.js';

const CPF_VALIDO = '529.982.247-25';
const dadosCliente = { nome: 'Maria Souza', cpf: CPF_VALIDO, telefone: '(11) 98888-7777', email: 'maria@email.com' };
const dadosVeiculo = { placa: 'abc-1d23', marca: 'Fiat', modelo: 'Uno', ano: 2015, quilometragem: 80000 };

test('Cliente: aceita CPF válido e guarda apenas os dígitos', () => {
  const c = new Cliente(dadosCliente);
  assert.equal(c.getCpf(), '52998224725');
  assert.equal(c.validarCpf(), true);
});

test('Cliente: rejeita CPF com dígito verificador errado', () => {
  assert.throws(() => new Cliente({ ...dadosCliente, cpf: '529.982.247-26' }), /CPF inválido/);
  assert.throws(() => new Cliente({ ...dadosCliente, cpf: '111.111.111-11' }), /CPF inválido/);
});

test('Cliente: anonimizarDados remove os dados pessoais (RNF-07)', () => {
  const c = new Cliente(dadosCliente);
  c.anonimizarDados();
  assert.equal(c.getCpf(), '');
  assert.equal(c.getNome(), 'Cliente anonimizado');
});

test('Veiculo: normaliza placa e aceita formato Mercosul e antigo', () => {
  assert.equal(new Veiculo(dadosVeiculo).getPlaca(), 'ABC1D23');
  assert.equal(new Veiculo({ ...dadosVeiculo, placa: 'XYZ-9876' }).getPlaca(), 'XYZ9876');
  assert.throws(() => new Veiculo({ ...dadosVeiculo, placa: '12ABCDE' }), /Placa inválida/);
});

test('Veiculo: quilometragem não pode diminuir', () => {
  const v = new Veiculo(dadosVeiculo);
  v.atualizarQuilometragem(85000);
  assert.equal(v.getQuilometragem(), 85000);
  assert.throws(() => v.atualizarQuilometragem(1000), /não pode ser menor/);
});

test('RN-01: não permite dois clientes com o mesmo CPF', () => {
  const s = new CadastroService();
  s.cadastrarCliente(dadosCliente);
  assert.throws(() => s.cadastrarCliente({ ...dadosCliente, nome: 'Outra' }), RegraDeNegocioError);
});

test('RN-02: não permite dois veículos com a mesma placa', () => {
  const s = new CadastroService();
  s.cadastrarCliente(dadosCliente);
  s.cadastrarVeiculo(CPF_VALIDO, dadosVeiculo);
  assert.throws(() => s.cadastrarVeiculo(CPF_VALIDO, { ...dadosVeiculo, modelo: 'Palio' }), RegraDeNegocioError);
});

test('Cliente pode ter vários veículos e a busca por placa encontra o dono', () => {
  const s = new CadastroService();
  s.cadastrarCliente(dadosCliente);
  s.cadastrarVeiculo(CPF_VALIDO, dadosVeiculo);
  s.cadastrarVeiculo(CPF_VALIDO, { ...dadosVeiculo, placa: 'DEF4567', modelo: 'Strada' });
  assert.equal(s.buscarClientePorCpf(CPF_VALIDO).getVeiculos().length, 2);
  const { cliente, veiculo } = s.buscarVeiculoPorPlaca('def-4567');
  assert.equal(cliente.getNome(), 'Maria Souza');
  assert.equal(veiculo.getModelo(), 'Strada');
});
