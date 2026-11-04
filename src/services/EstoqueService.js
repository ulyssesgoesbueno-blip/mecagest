// Estoque de peças (caso de uso Gerenciar Estoque de Peças)
import Peca from '../models/Peca.js';
import { RegraDeNegocioError, NaoEncontradoError } from './CadastroService.js';

export default class EstoqueService {
  #pecas = new Map(); // chave: código

  constructor(pecasIniciais = []) {
    pecasIniciais.forEach((dados) => this.cadastrarPeca(dados));
  }

  cadastrarPeca(dados) {
    const peca = new Peca(dados);
    if (this.#pecas.has(peca.getCodigo())) {
      throw new RegraDeNegocioError('Já existe uma peça com este código.');
    }
    this.#pecas.set(peca.getCodigo(), peca);
    return peca;
  }

  buscarPeca(codigo) {
    const peca = this.#pecas.get(String(codigo || '').trim().toUpperCase());
    if (!peca) throw new NaoEncontradoError('Peça não encontrada no estoque.');
    return peca;
  }

  listarPecas() {
    return [...this.#pecas.values()];
  }
}
