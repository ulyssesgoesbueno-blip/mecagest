import { test } from 'node:test';
import assert from 'node:assert/strict';
import CadastroService from '../src/services/CadastroService.js';
import EstoqueService from '../src/services/EstoqueService.js';
import OrdemServicoService from '../src/services/OrdemServicoService.js';
import ServicoMensagens from '../src/externo/ServicoMensagens.js';
import StatusOS from '../src/models/StatusOS.js';

const DIA = 24 * 60 * 60 * 1000;

function cenarioComOrcamento({ qtdFiltro = 1 } = {}) {
  const cadastro = new CadastroService();
  const estoque = new EstoqueService([
    { codigo: 'FO-001', descricao: 'Filtro de óleo', precoVenda: 35, quantidadeEstoque: 3, estoqueMinimo: 2 },
  ]);
  const ordens = new OrdemServicoService(cadastro, estoque);
  cadastro.cadastrarCliente({ nome: 'Maria Souza', cpf: '529.982.247-25', telefone: '11988887777' });
  cadastro.cadastrarVeiculo('52998224725', { placa: 'ABC1D23', marca: 'Fiat', modelo: 'Uno', ano: 2015 });
  ordens.abrirOrdem({ placa: 'ABC1D23', problemaRelatado: 'Troca de óleo' });
  ordens.adicionarServico(1, { descricao: 'Troca de óleo', valorMaoDeObra: 60 });
  ordens.adicionarPeca(1, { codigo: 'FO-001', quantidade: qtdFiltro });
  ordens.elaborarOrcamento(1, { diagnostico: 'Óleo vencido' });
  return { ordens, estoque };
}

test('UC-03: aprovação baixa o estoque e emite alerta de estoque mínimo', () => {
  const { ordens, estoque } = cenarioComOrcamento();
  const { ordem, alertasEstoque } = ordens.registrarDecisao(1, { aprovado: true });
  assert.equal(ordem.getStatus(), StatusOS.EM_EXECUCAO);
  assert.equal(estoque.buscarPeca('FO-001').getQuantidadeEstoque(), 2);
  assert.deepEqual(alertasEstoque, ['Filtro de óleo']); // 2 <= mínimo 2
});

test('UC-03 exceção 5a / RN-05: não aprova com estoque insuficiente e não baixa nada', () => {
  const { ordens, estoque } = cenarioComOrcamento({ qtdFiltro: 5 });
  assert.throws(() => ordens.registrarDecisao(1, { aprovado: true }), /estoque insuficiente/);
  assert.equal(ordens.buscarOrdem(1).getStatus(), StatusOS.AGUARDANDO_APROVACAO);
  assert.equal(estoque.buscarPeca('FO-001').getQuantidadeEstoque(), 3);
});

test('UC-03 fluxo 4a: recusa cancela a OS e libera o veículo para nova OS', () => {
  const { ordens } = cenarioComOrcamento();
  ordens.registrarDecisao(1, { aprovado: false });
  assert.equal(ordens.buscarOrdem(1).getStatus(), StatusOS.CANCELADA);
  assert.equal(ordens.abrirOrdem({ placa: 'ABC1D23', problemaRelatado: 'Nova visita' }).getNumero(), 2);
});

test('RN-04: não conclui serviço antes da aprovação', () => {
  const { ordens } = cenarioComOrcamento();
  assert.throws(() => ordens.concluirServico(1, 0), /depois que o orçamento for aprovado/);
});

test('UC-04: não finaliza com serviço pendente; ao finalizar, notifica o cliente', () => {
  const { ordens } = cenarioComOrcamento();
  ordens.registrarDecisao(1, { aprovado: true });
  assert.throws(() => ordens.finalizarOrdem(1), /pendentes: Troca de óleo/);
  ordens.concluirServico(1, 0);
  const os = ordens.finalizarOrdem(1);
  assert.equal(os.getStatus(), StatusOS.PRONTA_PARA_RETIRADA);
  const [notificacao] = os.toJSON().notificacoes;
  assert.equal(notificacao.enviada, true);
  assert.match(notificacao.mensagem, /ABC1D23 está pronto para retirada/);
});

test('UC-04 exceção 6a: falha no Serviço de Mensagens fica registrada, OS continua pronta', () => {
  const { ordens } = cenarioComOrcamento();
  ordens.registrarDecisao(1, { aprovado: true });
  ordens.concluirServico(1, 0);
  ServicoMensagens.disponivel = false;
  try {
    const os = ordens.finalizarOrdem(1);
    assert.equal(os.getStatus(), StatusOS.PRONTA_PARA_RETIRADA);
    assert.equal(os.toJSON().notificacoes[0].enviada, false);
  } finally {
    ServicoMensagens.disponivel = true;
  }
});

test('RN-06: pagamento menor que o total é recusado; pagamento correto finaliza a OS', () => {
  const { ordens } = cenarioComOrcamento();
  ordens.registrarDecisao(1, { aprovado: true });
  ordens.concluirServico(1, 0);
  ordens.finalizarOrdem(1);
  assert.throws(() => ordens.registrarPagamento(1, { valor: 50, forma: 'PIX' }), /menor que o total/);
  assert.throws(() => ordens.registrarPagamento(1, { valor: 95, forma: 'CHEQUE' }), /Forma de pagamento inválida/);
  const os = ordens.registrarPagamento(1, { valor: 95, forma: 'PIX' });
  assert.equal(os.getStatus(), StatusOS.FINALIZADA);
});

test('RN-07: mesmo serviço em até 90 dias não cobra mão de obra; depois disso, cobra', () => {
  for (const [diasAtras, valorEsperado] of [[30, 0], [120, 60]]) {
    const { ordens } = cenarioComOrcamento();
    ordens.registrarDecisao(1, { aprovado: true });
    ordens.concluirServico(1, 0);
    ordens.finalizarOrdem(1);
    ordens.buscarOrdem(1).registrarPagamento(95, 'PIX', new Date(Date.now() - diasAtras * DIA));
    ordens.abrirOrdem({ placa: 'ABC1D23', problemaRelatado: 'Barulho no motor' });
    const os2 = ordens.adicionarServico(2, { descricao: '  troca de ÓLEO ', valorMaoDeObra: 60 });
    assert.equal(os2.calcularTotalMaoDeObra(), valorEsperado, `${diasAtras} dias atrás`);
  }
});
