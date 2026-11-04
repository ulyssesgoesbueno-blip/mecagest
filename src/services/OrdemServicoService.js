// Casos de uso Abrir Ordem de Serviço (UC-01) e Elaborar Orçamento (UC-02)
import OrdemDeServico from '../models/OrdemDeServico.js';
import StatusOS from '../models/StatusOS.js';
import { RegraDeNegocioError, NaoEncontradoError } from './CadastroService.js';

const DIAS_GARANTIA = 90;
const DIA_EM_MS = 24 * 60 * 60 * 1000;

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
    const item = ordem.adicionarServico(descricao, valorMaoDeObra);
    // Aplicar Garantia de Serviço (<<extend>>) — RN-07
    if (this.#servicoEmGarantia(ordem, item.getDescricao())) item.aplicarGarantia();
    return ordem;
  }

  // Mesmo serviço feito no mesmo veículo em uma OS finalizada há até 90 dias
  #servicoEmGarantia(ordemAtual, descricao, hoje = new Date()) {
    const igual = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();
    return ordemAtual.getVeiculo().getHistorico().some((os) => {
      const pagamento = os.getPagamento();
      if (os === ordemAtual || os.getStatus() !== StatusOS.FINALIZADA || !pagamento) return false;
      const dias = (hoje - pagamento.getDataPagamento()) / DIA_EM_MS;
      return dias <= DIAS_GARANTIA && os.getItensServico().some((s) => igual(s.getDescricao(), descricao));
    });
  }

  // UC-03: registra a decisão do cliente sobre o orçamento
  registrarDecisao(numero, { aprovado }) {
    const ordem = this.buscarOrdem(numero);
    if (aprovado === true || aprovado === 'true') {
      const alertas = ordem.aprovarOrcamento();
      return { ordem, alertasEstoque: alertas.map((p) => p.getDescricao()) };
    }
    ordem.recusarOrcamento();
    return { ordem, alertasEstoque: [] };
  }

  concluirServico(numero, indice) {
    const ordem = this.buscarOrdem(numero);
    ordem.concluirServico(indice);
    return ordem;
  }

  // UC-04: finaliza e executa Notificar Cliente (<<include>>)
  finalizarOrdem(numero) {
    const ordem = this.buscarOrdem(numero);
    ordem.finalizar();
    const { cliente } = this.#cadastro.buscarVeiculoPorPlaca(ordem.getVeiculo().getPlaca());
    const valor = ordem.calcularTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const notificacao = ordem.criarNotificacao(
      `Olá, ${cliente.getNome()}! Seu veículo ${ordem.getVeiculo().getPlaca()} está pronto para retirada. Valor total: ${valor}.`,
    );
    notificacao.enviar(cliente.getTelefone()); // exceção 6a: se falhar, fica registrado como não enviada
    return ordem;
  }

  registrarPagamento(numero, { valor, forma }) {
    const ordem = this.buscarOrdem(numero);
    ordem.registrarPagamento(valor, forma);
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
