// Casos de uso Cadastrar Cliente, Cadastrar Veículo e Consultar Veículo
import Cliente from '../models/Cliente.js';
import Veiculo from '../models/Veiculo.js';

export class RegraDeNegocioError extends Error {}
export class NaoEncontradoError extends Error {}

export default class CadastroService {
  #clientes = new Map(); // chave: CPF
  #donoDoVeiculo = new Map(); // chave: placa -> Cliente
  #proximoId = 1;

  cadastrarCliente(dados) {
    const cliente = new Cliente({ ...dados, id: this.#proximoId });
    // RN-01: cliente único por CPF
    if (this.#clientes.has(cliente.getCpf())) {
      throw new RegraDeNegocioError('Já existe um cliente cadastrado com este CPF.');
    }
    this.#clientes.set(cliente.getCpf(), cliente);
    this.#proximoId++;
    return cliente;
  }

  buscarClientePorCpf(cpf) {
    const cliente = this.#clientes.get(Cliente.somenteDigitos(cpf));
    if (!cliente) throw new NaoEncontradoError('Cliente não encontrado.');
    return cliente;
  }

  listarClientes() {
    return [...this.#clientes.values()];
  }

  cadastrarVeiculo(cpfCliente, dados) {
    const cliente = this.buscarClientePorCpf(cpfCliente);
    const veiculo = new Veiculo(dados);
    // RN-02: veículo único por placa
    if (this.#donoDoVeiculo.has(veiculo.getPlaca())) {
      throw new RegraDeNegocioError('Já existe um veículo cadastrado com esta placa.');
    }
    cliente.adicionarVeiculo(veiculo);
    this.#donoDoVeiculo.set(veiculo.getPlaca(), cliente);
    return veiculo;
  }

  // Consultar Veículo: retorna o veículo e o seu proprietário
  buscarVeiculoPorPlaca(placa) {
    const chave = Veiculo.normalizarPlaca(placa);
    const cliente = this.#donoDoVeiculo.get(chave);
    if (!cliente) throw new NaoEncontradoError('Veículo não encontrado.');
    const veiculo = cliente.getVeiculos().find((v) => v.getPlaca() === chave);
    return { veiculo, cliente };
  }
}
