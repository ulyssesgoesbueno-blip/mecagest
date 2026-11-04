// Classe de projeto OrdemDeServico (ver docs/03-diagrama-de-classes.md)
import StatusOS from './StatusOS.js';
import ItemServico from './ItemServico.js';
import ItemPeca from './ItemPeca.js';
import Pagamento from './Pagamento.js';
import Notificacao from './Notificacao.js';

const STATUS_INATIVOS = [StatusOS.FINALIZADA, StatusOS.CANCELADA];

export default class OrdemDeServico {
  #numero;
  #dataEntrada;
  #quilometragemEntrada;
  #problemaRelatado;
  #diagnostico = '';
  #status = StatusOS.ABERTA;
  #dataDecisao = null;
  #veiculo;
  #itensServico = []; // composição 1 ◆— 1..*
  #itensPeca = []; // composição 1 ◆— 0..*
  #pagamento = null; // composição 1 ◆— 0..1
  #notificacoes = []; // composição 1 ◆— 0..*

  constructor({ numero, veiculo, quilometragemEntrada, problemaRelatado, dataEntrada = new Date() }) {
    if (!problemaRelatado || !problemaRelatado.trim()) {
      throw new Error('A descrição do problema relatado é obrigatória.');
    }
    this.#numero = numero;
    this.#veiculo = veiculo;
    this.#quilometragemEntrada = Number(quilometragemEntrada);
    this.#problemaRelatado = problemaRelatado.trim();
    this.#dataEntrada = dataEntrada;
  }

  #exigirStatus(...permitidos) {
    if (!permitidos.includes(this.#status)) {
      throw new Error(`Operação não permitida: a OS está com status ${this.#status}.`);
    }
  }

  adicionarServico(descricao, valor) {
    this.#exigirStatus(StatusOS.ABERTA);
    const item = new ItemServico({ descricao, valorMaoDeObra: valor });
    this.#itensServico.push(item);
    return item;
  }

  adicionarPeca(peca, quantidade) {
    this.#exigirStatus(StatusOS.ABERTA);
    const item = new ItemPeca(peca, quantidade);
    this.#itensPeca.push(item);
    return item;
  }

  // UC-02 passo 8: confirma o orçamento e aguarda a decisão do cliente
  elaborarOrcamento(diagnostico) {
    this.#exigirStatus(StatusOS.ABERTA);
    if (!diagnostico || !diagnostico.trim()) throw new Error('O diagnóstico é obrigatório.');
    if (this.#itensServico.length === 0) throw new Error('Adicione pelo menos um serviço ao orçamento.');
    this.#diagnostico = diagnostico.trim();
    this.#status = StatusOS.AGUARDANDO_APROVACAO;
  }

  // UC-03: cliente aprovou o orçamento. Retorna as peças que ficaram no estoque mínimo (RF-10).
  aprovarOrcamento() {
    this.#exigirStatus(StatusOS.AGUARDANDO_APROVACAO);
    // RN-05: soma a quantidade pedida de cada peça e confere o estoque antes de aprovar
    const necessario = new Map();
    this.#itensPeca.forEach((i) => necessario.set(i.getPeca(), (necessario.get(i.getPeca()) || 0) + i.getQuantidade()));
    const emFalta = [...necessario].filter(([peca, qtd]) => !peca.temDisponivel(qtd)).map(([peca]) => peca.getDescricao());
    if (emFalta.length > 0) {
      throw new Error(`Não é possível aprovar: estoque insuficiente de ${emFalta.join(', ')}.`);
    }
    // RF-08 / Baixar Peças do Estoque (<<include>>)
    necessario.forEach((qtd, peca) => peca.baixarEstoque(qtd));
    this.#dataDecisao = new Date();
    this.#status = StatusOS.EM_EXECUCAO;
    // Emitir Alerta de Estoque Mínimo (<<extend>>)
    return [...necessario.keys()].filter((peca) => peca.estaAbaixoDoMinimo());
  }

  // UC-03 fluxo alternativo 4a: cliente recusou
  recusarOrcamento() {
    this.#exigirStatus(StatusOS.AGUARDANDO_APROVACAO);
    this.#dataDecisao = new Date();
    this.#status = StatusOS.CANCELADA;
  }

  // Registrar Execução de Serviço — RN-04: só depois da aprovação
  concluirServico(indice) {
    if (this.#status !== StatusOS.EM_EXECUCAO) {
      throw new Error('Só é possível concluir serviços depois que o orçamento for aprovado.');
    }
    const item = this.#itensServico[Number(indice)];
    if (!item) throw new Error('Serviço não encontrado nesta OS.');
    item.concluir();
  }

  // UC-04: todos os serviços concluídos -> pronta para retirada
  finalizar() {
    this.#exigirStatus(StatusOS.EM_EXECUCAO);
    const pendentes = this.#itensServico.filter((i) => !i.estaConcluido()).map((i) => i.getDescricao());
    if (pendentes.length > 0) throw new Error(`Ainda há serviços pendentes: ${pendentes.join(', ')}.`);
    this.#status = StatusOS.PRONTA_PARA_RETIRADA;
  }

  criarNotificacao(mensagem) {
    const notificacao = new Notificacao(mensagem);
    this.#notificacoes.push(notificacao);
    return notificacao;
  }

  // RF-12 / RN-06: a OS só é finalizada após o pagamento do valor total
  registrarPagamento(valor, forma, dataPagamento = new Date()) {
    this.#exigirStatus(StatusOS.PRONTA_PARA_RETIRADA);
    const pagamento = new Pagamento({ valorPago: valor, forma, dataPagamento });
    if (pagamento.getValorPago() + 0.005 < this.calcularTotal()) {
      throw new Error('O valor pago é menor que o total da ordem de serviço.');
    }
    this.#pagamento = pagamento;
    this.#status = StatusOS.FINALIZADA;
  }

  getPagamento() { return this.#pagamento; }

  calcularTotalMaoDeObra() {
    return this.#itensServico.reduce((soma, i) => soma + i.getValor(), 0);
  }

  calcularTotalPecas() {
    return this.#itensPeca.reduce((soma, i) => soma + i.calcularSubtotal(), 0);
  }

  calcularTotal() {
    return this.calcularTotalMaoDeObra() + this.calcularTotalPecas();
  }

  // RN-03: OS ativa = qualquer status diferente de FINALIZADA ou CANCELADA
  estaAtiva() {
    return !STATUS_INATIVOS.includes(this.#status);
  }

  getNumero() { return this.#numero; }
  getStatus() { return this.#status; }
  getVeiculo() { return this.#veiculo; }
  getItensServico() { return [...this.#itensServico]; }
  getItensPeca() { return [...this.#itensPeca]; }

  toJSON() {
    return {
      numero: this.#numero,
      dataEntrada: this.#dataEntrada.toISOString(),
      quilometragemEntrada: this.#quilometragemEntrada,
      problemaRelatado: this.#problemaRelatado,
      diagnostico: this.#diagnostico,
      status: this.#status,
      dataDecisao: this.#dataDecisao ? this.#dataDecisao.toISOString() : null,
      veiculo: { placa: this.#veiculo.getPlaca(), marca: this.#veiculo.getMarca(), modelo: this.#veiculo.getModelo() },
      servicos: this.#itensServico.map((i) => i.toJSON()),
      pecas: this.#itensPeca.map((i) => i.toJSON()),
      totalMaoDeObra: this.calcularTotalMaoDeObra(),
      totalPecas: this.calcularTotalPecas(),
      total: this.calcularTotal(),
      pagamento: this.#pagamento ? this.#pagamento.toJSON() : null,
      notificacoes: this.#notificacoes.map((n) => n.toJSON()),
    };
  }
}
