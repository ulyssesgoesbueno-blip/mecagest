// Classe de projeto ItemPeca — classe associativa entre OrdemDeServico e Peca
export default class ItemPeca {
  #peca;
  #quantidade;
  #precoUnitario; // preço "congelado" no momento do orçamento

  constructor(peca, quantidade) {
    const n = Number(quantidade);
    if (!Number.isInteger(n) || n < 1) throw new Error('Quantidade da peça deve ser um número inteiro maior que zero.');
    this.#peca = peca;
    this.#quantidade = n;
    this.#precoUnitario = peca.getPrecoVenda();
  }

  calcularSubtotal() {
    return this.#quantidade * this.#precoUnitario;
  }

  getPeca() { return this.#peca; }
  getQuantidade() { return this.#quantidade; }

  toJSON() {
    return {
      codigo: this.#peca.getCodigo(),
      descricao: this.#peca.getDescricao(),
      quantidade: this.#quantidade,
      precoUnitario: this.#precoUnitario,
      subtotal: this.calcularSubtotal(),
    };
  }
}
