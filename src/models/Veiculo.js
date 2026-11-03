// Classe de projeto Veiculo (ver docs/03-diagrama-de-classes.md)
const ANO_MINIMO = 1950;

export default class Veiculo {
  #placa;
  #marca;
  #modelo;
  #ano;
  #quilometragem;
  #ordensDeServico = []; // associação Veiculo — OrdemDeServico (1 — 0..*)

  constructor({ placa, marca, modelo, ano, quilometragem = 0 }) {
    this.#placa = Veiculo.normalizarPlaca(placa);
    if (!Veiculo.placaValida(this.#placa)) {
      throw new Error('Placa inválida. Use o formato ABC1234 ou ABC1D23 (Mercosul).');
    }
    if (!marca || !modelo) throw new Error('Marca e modelo são obrigatórios.');
    const anoNum = Number(ano);
    const anoMaximo = new Date().getFullYear() + 1;
    if (!Number.isInteger(anoNum) || anoNum < ANO_MINIMO || anoNum > anoMaximo) {
      throw new Error(`Ano inválido (entre ${ANO_MINIMO} e ${anoMaximo}).`);
    }
    this.#marca = marca.trim();
    this.#modelo = modelo.trim();
    this.#ano = anoNum;
    this.#quilometragem = 0;
    this.atualizarQuilometragem(quilometragem);
  }

  static normalizarPlaca(placa) {
    return String(placa || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  // Formato antigo (ABC1234) ou Mercosul (ABC1D23)
  static placaValida(placa) {
    return /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(placa);
  }

  atualizarQuilometragem(km) {
    const valor = Number(km);
    if (!Number.isInteger(valor) || valor < 0) throw new Error('Quilometragem inválida.');
    if (valor < this.#quilometragem) {
      throw new Error('A quilometragem não pode ser menor que a última registrada.');
    }
    this.#quilometragem = valor;
  }

  registrarOrdemDeServico(ordem) {
    this.#ordensDeServico.push(ordem);
  }

  getHistorico() {
    return [...this.#ordensDeServico];
  }

  // RN-03: só pode haver uma OS ativa por veículo
  possuiOSAtiva() {
    return this.#ordensDeServico.some((os) => os.estaAtiva());
  }

  getPlaca() { return this.#placa; }
  getMarca() { return this.#marca; }
  getModelo() { return this.#modelo; }
  getAno() { return this.#ano; }
  getQuilometragem() { return this.#quilometragem; }

  toJSON() {
    return {
      placa: this.#placa,
      marca: this.#marca,
      modelo: this.#modelo,
      ano: this.#ano,
      quilometragem: this.#quilometragem,
    };
  }
}
