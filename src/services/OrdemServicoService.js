// Casos de uso Abrir Ordem de Serviço (UC-01) e Elaborar Orçamento (UC-02)
import OrdemDeServico from '../models/OrdemDeServico.js';
import { RegraDeNegocioError, NaoEncontradoError } from './CadastroService.js';

export default class OrdemServicoService {
  #ordens = new Map(); // chave: número da OS
  #proximoNumero = 1;
  #cadastro;
  #estoque;

  constructor(cadastroService, estoqueService) {
    this.#cadastro = cadastroService;
    this.#estoque = estoqueService;
  }

  abrirOrdem({ placa, quilometragem, problemaRelatado }) {
    // passo 3: Consultar Veículo (<<include>>)
    const { veiculo } = this.#cadastro.buscarVeiculoPorPlaca(placa);
    // exceção 3b — RN-03: uma OS ativa por veículo
    if (veiculo.possuiOSAtiva()) {
      const ativa = veiculo.getHistorico().find((os) => os.estaAtiva());
      throw new RegraDeNegocioError(`O veículo já possui a OS nº ${ativa.getNumero()} em andamento.`);
    }
    const km = quilometragem === undefined || quilometragem === '' ? veiculo.getQuilometragem() : quilometragem;
    const ordem = new OrdemDeServico({
      numero: this.#proximoNumero,
      veiculo,
      quilometragemEntrada: km,
      problemaRelatado,
    });
    veiculo.atualizarQuilometragem(km); // fluxo alternativo 4a: não aceita km menor
    veiculo.registrarOrdemDeServico(ordem);
    this.#ordens.set(ordem.getNumero(), ordem);
    this.#proximoNumero++;
    return ordem;
  }

  buscarOrdem(numero) {
    const ordem = this.#ordens.get(Number(numero));
    if (!ordem) throw new NaoEncontradoError('Ordem de serviço não encontrada.');
    return ordem;
  }

  listarOrdens() {
    return [...this.#ordens.values()].reverse();
  }

  adicionarServico(numero, { descricao, valorMaoDeObra }) {
    const ordem = this.buscarOrdem(numero);
    ordem.adicionarServico(descricao, valorMaoDeObra);
    return ordem;
  }

  adicionarPeca(numero, { codigo, quantidade }) {
    const ordem = this.buscarOrdem(numero);
    const peca = this.#estoque.buscarPeca(codigo); // exceção 5b: peça não cadastrada
    ordem.adicionarPeca(peca, quantidade);
    return ordem;
  }

  elaborarOrcamento(numero, { diagnostico }) {
    const ordem = this.buscarOrdem(numero);
    ordem.elaborarOrcamento(diagnostico);
    return ordem;
  }
}
