// Classe de projeto Peca (ver docs/03-diagrama-de-classes.md)
export default class Peca {
  #codigo;
  #descricao;
  #precoVenda;
  #quantidadeEstoque;
  #estoqueMinimo;

  constructor({ codigo, descricao, precoVenda, quantidadeEstoque = 0, estoqueMinimo = 0 }) {
    if (!codigo || !descricao) throw new Error('Código e descrição da peça são obrigatórios.');
    if (!(Number(precoVenda) >= 0)) throw new Error('Preço de venda inválido.');
    this.#codigo = String(codigo).trim().toUpperCase();
    this.#descricao = descricao.trim();
    this.#precoVenda = Number(precoVenda);
    this.#quantidadeEstoque = Peca.#quantidadeValida(quantidadeEstoque, true);
    this.#estoqueMinimo = Peca.#quantidadeValida(estoqueMinimo, true);
  }

  static #quantidadeValida(valor, aceitaZero = false) {
    const n = Number(valor);
    if (!Number.isInteger(n) || n < (aceitaZero ? 0 : 1)) throw new Error('Quantidade inválida.');
    return n;
  }

  temDisponivel(quantidade) {
    return this.#quantidadeEstoque >= quantidade;
  }

  // RF-08: baixa no estoque (usada na aprovação do orçamento)
  baixarEstoque(quantidade) {
    const n = Peca.#quantidadeValida(quantidade);
    if (!this.temDisponivel(n)) throw new Error(`Estoque insuficiente da peça ${this.#codigo}.`);
    this.#quantidadeEstoque -= n;
  }

  // RF-09: entrada de novas unidades
  registrarEntrada(quantidade) {
    this.#quantidadeEstoque += Peca.#quantidadeValida(quantidade);
  }

  // RF-10: alerta de estoque mínimo
  estaAbaixoDoMinimo() {
    return this.#quantidadeEstoque <= this.#estoqueMinimo;
  }

  getCodigo() { return this.#codigo; }
  getDescricao() { return this.#descricao; }
  getPrecoVenda() { return this.#precoVenda; }
  getQuantidadeEstoque() { return this.#quantidadeEstoque; }

  toJSON() {
    return {
      codigo: this.#codigo,
      descricao: this.#descricao,
      precoVenda: this.#precoVenda,
      quantidadeEstoque: this.#quantidadeEstoque,
      estoqueMinimo: this.#estoqueMinimo,
      abaixoDoMinimo: this.estaAbaixoDoMinimo(),
    };
  }
}
