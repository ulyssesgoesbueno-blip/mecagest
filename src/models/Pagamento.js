// Classe de projeto Pagamento — parte da OrdemDeServico (composição)
import FormaPagamento from './FormaPagamento.js';

export default class Pagamento {
  #valorPago;
  #dataPagamento;
  #forma;

  constructor({ valorPago, forma, dataPagamento = new Date() }) {
    if (!Object.values(FormaPagamento).includes(forma)) throw new Error('Forma de pagamento inválida.');
    const valor = Number(valorPago);
    if (!Number.isFinite(valor) || valor < 0) throw new Error('Valor pago inválido.');
    this.#valorPago = valor;
    this.#forma = forma;
    this.#dataPagamento = dataPagamento;
  }

  getValorPago() { return this.#valorPago; }
  getDataPagamento() { return this.#dataPagamento; }

  toJSON() {
    return { valorPago: this.#valorPago, forma: this.#forma, dataPagamento: this.#dataPagamento.toISOString() };
  }
}
