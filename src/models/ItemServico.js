// Classe de projeto ItemServico — parte da OrdemDeServico (composição)
export default class ItemServico {
  #descricao;
  #valorMaoDeObra;
  #concluido = false;
  #emGarantia = false;

  constructor({ descricao, valorMaoDeObra }) {
    if (!descricao || !descricao.trim()) throw new Error('Descrição do serviço é obrigatória.');
    const valor = Number(valorMaoDeObra);
    if (!Number.isFinite(valor) || valor < 0) throw new Error('Valor da mão de obra inválido.');
    this.#descricao = descricao.trim();
    this.#valorMaoDeObra = valor;
  }

  concluir() {
    this.#concluido = true;
  }

  // RN-07: serviço repetido em até 90 dias não cobra mão de obra
  aplicarGarantia() {
    this.#emGarantia = true;
  }

  getValor() {
    return this.#emGarantia ? 0 : this.#valorMaoDeObra;
  }

  getDescricao() { return this.#descricao; }
  estaConcluido() { return this.#concluido; }

  toJSON() {
    return {
      descricao: this.#descricao,
      valorMaoDeObra: this.#valorMaoDeObra,
      concluido: this.#concluido,
      emGarantia: this.#emGarantia,
      valor: this.getValor(),
    };
  }
}
