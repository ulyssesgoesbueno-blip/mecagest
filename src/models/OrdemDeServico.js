// Classe de projeto OrdemDeServico (ver docs/03-diagrama-de-classes.md)
import StatusOS from './StatusOS.js';
import ItemServico from './ItemServico.js';
import ItemPeca from './ItemPeca.js';

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
    };
  }
}
