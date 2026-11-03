import { Router } from 'express';
import { RegraDeNegocioError, NaoEncontradoError } from '../services/CadastroService.js';

// Converte erros do domínio em respostas HTTP
function responderErro(res, erro) {
  if (erro instanceof NaoEncontradoError) return res.status(404).json({ erro: erro.message });
  if (erro instanceof RegraDeNegocioError) return res.status(409).json({ erro: erro.message });
  return res.status(400).json({ erro: erro.message });
}

export default function criarRotasCadastro(service) {
  const router = Router();

  router.get('/clientes', (_req, res) => {
    res.json(service.listarClientes());
  });

  router.post('/clientes', (req, res) => {
    try {
      res.status(201).json(service.cadastrarCliente(req.body));
    } catch (erro) {
      responderErro(res, erro);
    }
  });

  router.get('/clientes/:cpf', (req, res) => {
    try {
      res.json(service.buscarClientePorCpf(req.params.cpf));
    } catch (erro) {
      responderErro(res, erro);
    }
  });

  router.post('/clientes/:cpf/veiculos', (req, res) => {
    try {
      res.status(201).json(service.cadastrarVeiculo(req.params.cpf, req.body));
    } catch (erro) {
      responderErro(res, erro);
    }
  });

  router.get('/veiculos/:placa', (req, res) => {
    try {
      const { veiculo, cliente } = service.buscarVeiculoPorPlaca(req.params.placa);
      res.json({ ...veiculo.toJSON(), proprietario: { nome: cliente.getNome(), cpf: cliente.getCpf() } });
    } catch (erro) {
      responderErro(res, erro);
    }
  });

  return router;
}
