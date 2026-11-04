import { Router } from 'express';
import { responderErro } from './erros.js';

export default function criarRotasOrdens(ordemService, estoqueService) {
  const router = Router();

  // Executa a ação e devolve a OS atualizada (ou o erro correspondente)
  const acao = (status, fn) => (req, res) => {
    try {
      res.status(status).json(fn(req));
    } catch (erro) {
      responderErro(res, erro);
    }
  };

  router.get('/pecas', (_req, res) => res.json(estoqueService.listarPecas()));

  router.get('/ordens', (_req, res) => res.json(ordemService.listarOrdens()));
  router.post('/ordens', acao(201, (req) => ordemService.abrirOrdem(req.body)));
  router.get('/ordens/:numero', acao(200, (req) => ordemService.buscarOrdem(req.params.numero)));
  router.post('/ordens/:numero/servicos', acao(200, (req) => ordemService.adicionarServico(req.params.numero, req.body)));
  router.post('/ordens/:numero/pecas', acao(200, (req) => ordemService.adicionarPeca(req.params.numero, req.body)));
  router.post('/ordens/:numero/orcamento', acao(200, (req) => ordemService.elaborarOrcamento(req.params.numero, req.body)));
  router.post('/ordens/:numero/decisao', acao(200, (req) => {
    const { ordem, alertasEstoque } = ordemService.registrarDecisao(req.params.numero, req.body);
    return { ...ordem.toJSON(), alertasEstoque };
  }));
  router.post('/ordens/:numero/servicos/:indice/conclusao',
    acao(200, (req) => ordemService.concluirServico(req.params.numero, req.params.indice)));
  router.post('/ordens/:numero/finalizacao', acao(200, (req) => ordemService.finalizarOrdem(req.params.numero)));
  router.post('/ordens/:numero/pagamento', acao(200, (req) => ordemService.registrarPagamento(req.params.numero, req.body)));

  return router;
}
