import { test } from 'node:test';
import assert from 'node:assert/strict';
import CadastroService, { RegraDeNegocioError, NaoEncontradoError } from '../src/services/CadastroService.js';
import EstoqueService from '../src/services/EstoqueService.js';
import OrdemServicoService from '../src/services/OrdemServicoService.js';
import StatusOS from '../src/models/StatusOS.js';

function montarCenario() {
  const cadastro = new CadastroService();
  const estoque = new EstoqueService([
    { codigo: 'FO-001', descricao: 'Filtro de óleo', precoVenda: 35, quantidadeEstoque: 5, estoqueMinimo: 2 },
    { codigo: 'OL-5W30', descricao: 'Óleo 5W30', precoVenda: 40, quantidadeEstoque: 20, estoqueMinimo: 5 },
  ]);
  cadastro.cadastrarCliente({ nome: 'Maria Souza', cpf: '529.982.247-25', telefone: '11988887777' });
  cadastro.cadastrarVeiculo('52998224725', { placa: 'ABC1D23', marca: 'Fiat', modelo: 'Uno', ano: 2015, quilometragem: 80000 });
  return { cadastro, estoque, ordens: new OrdemServicoService(cadastro, estoque) };
}

test('UC-01: abre OS com status ABERTA e atualiza a quilometragem do veículo', () => {
  const { ordens, cadastro } = montarCenario();
  const os = ordens.abrirOrdem({ placa: 'abc-1d23', quilometragem: 81500, problemaRelatado: 'Barulho ao frear' });
  assert.equal(os.getNumero(), 1);
  assert.equal(os.getStatus(), StatusOS.ABERTA);
  assert.equal(cadastro.buscarVeiculoPorPlaca('ABC1D23').veiculo.getQuilometragem(), 81500);
});

test('UC-01 exceção 3b / RN-03: não abre segunda OS ativa para o mesmo veículo', () => {
  const { ordens } = montarCenario();
  ordens.abrirOrdem({ placa: 'ABC1D23', quilometragem: 81000, problemaRelatado: 'Revisão' });
  assert.throws(
    () => ordens.abrirOrdem({ placa: 'ABC1D23', quilometragem: 81000, problemaRelatado: 'Outro problema' }),
    (e) => e instanceof RegraDeNegocioError && /OS nº 1/.test(e.message),
  );
});

test('UC-01: rejeita placa não cadastrada, problema vazio e quilometragem menor', () => {
  const { ordens } = montarCenario();
  assert.throws(() => ordens.abrirOrdem({ placa: 'ZZZ9999', problemaRelatado: 'x' }), NaoEncontradoError);
  assert.throws(() => ordens.abrirOrdem({ placa: 'ABC1D23', problemaRelatado: '  ' }), /problema relatado/);
  assert.throws(() => ordens.abrirOrdem({ placa: 'ABC1D23', quilometragem: 100, problemaRelatado: 'x' }), /menor/);
});

test('UC-02: orçamento soma mão de obra e peças e passa a AGUARDANDO_APROVACAO', () => {
  const { ordens } = montarCenario();
  ordens.abrirOrdem({ placa: 'ABC1D23', problemaRelatado: 'Troca de óleo' });
  ordens.adicionarServico(1, { descricao: 'Troca de óleo e filtro', valorMaoDeObra: 80 });
  ordens.adicionarPeca(1, { codigo: 'ol-5w30', quantidade: 4 });
  ordens.adicionarPeca(1, { codigo: 'FO-001', quantidade: 1 });
  const os = ordens.elaborarOrcamento(1, { diagnostico: 'Óleo vencido' });
  assert.equal(os.calcularTotalMaoDeObra(), 80);
  assert.equal(os.calcularTotalPecas(), 4 * 40 + 35);
  assert.equal(os.calcularTotal(), 275);
  assert.equal(os.getStatus(), StatusOS.AGUARDANDO_APROVACAO);
});

test('UC-02 exceções: sem serviço não confirma; peça inexistente; OS confirmada não aceita itens', () => {
  const { ordens } = montarCenario();
  ordens.abrirOrdem({ placa: 'ABC1D23', problemaRelatado: 'Revisão' });
  assert.throws(() => ordens.elaborarOrcamento(1, { diagnostico: 'ok' }), /pelo menos um serviço/);
  assert.throws(() => ordens.adicionarPeca(1, { codigo: 'NAO-EXISTE', quantidade: 1 }), NaoEncontradoError);
  ordens.adicionarServico(1, { descricao: 'Revisão', valorMaoDeObra: 150 });
  ordens.elaborarOrcamento(1, { diagnostico: 'Revisão de rotina' });
  assert.throws(() => ordens.adicionarServico(1, { descricao: 'Extra', valorMaoDeObra: 10 }), /não permitida/);
});

test('ItemPeca guarda o preço do momento do orçamento', () => {
  const { ordens, estoque } = montarCenario();
  ordens.abrirOrdem({ placa: 'ABC1D23', problemaRelatado: 'Troca de filtro' });
  const os = ordens.adicionarPeca(1, { codigo: 'FO-001', quantidade: 2 });
  assert.equal(os.getItensPeca()[0].calcularSubtotal(), 70);
  assert.equal(estoque.buscarPeca('FO-001').getQuantidadeEstoque(), 5); // baixa só na aprovação (RF-08)
});
