// Classe de projeto Cliente (ver docs/03-diagrama-de-classes.md)
export default class Cliente {
  #id;
  #nome;
  #cpf;
  #telefone;
  #email;
  #veiculos = []; // agregação Cliente ◇— Veiculo (1 — 0..*)

  constructor({ id, nome, cpf, telefone, email }) {
    if (!nome || !nome.trim()) throw new Error('Nome do cliente é obrigatório.');
    this.#id = id;
    this.#nome = nome.trim();
    this.#cpf = Cliente.somenteDigitos(cpf);
    this.#telefone = Cliente.somenteDigitos(telefone);
    this.#email = (email || '').trim();
    if (!this.validarCpf()) throw new Error('CPF inválido.');
    if (this.#telefone.length < 10) throw new Error('Telefone inválido (informe DDD + número).');
  }

  static somenteDigitos(valor) {
    return String(valor || '').replace(/\D/g, '');
  }

  // Valida os dois dígitos verificadores do CPF
  validarCpf() {
    const cpf = this.#cpf;
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    const digito = (base) => {
      let soma = 0;
      for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (base.length + 1 - i);
      const resto = (soma * 10) % 11;
      return resto === 10 ? 0 : resto;
    };
    return digito(cpf.slice(0, 9)) === Number(cpf[9]) && digito(cpf.slice(0, 10)) === Number(cpf[10]);
  }

  adicionarVeiculo(veiculo) {
    this.#veiculos.push(veiculo);
  }

  getVeiculos() {
    return [...this.#veiculos];
  }

  // RNF-07 (LGPD): remove os dados pessoais, mantendo o histórico dos veículos
  anonimizarDados() {
    this.#nome = 'Cliente anonimizado';
    this.#cpf = '';
    this.#telefone = '';
    this.#email = '';
  }

  getId() { return this.#id; }
  getNome() { return this.#nome; }
  getCpf() { return this.#cpf; }
  getTelefone() { return this.#telefone; }
  getEmail() { return this.#email; }

  toJSON() {
    return {
      id: this.#id,
      nome: this.#nome,
      cpf: this.#cpf,
      telefone: this.#telefone,
      email: this.#email,
      veiculos: this.#veiculos.map((v) => v.toJSON()),
    };
  }
}
