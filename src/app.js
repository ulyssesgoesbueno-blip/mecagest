import express from 'express';
import { fileURLToPath } from 'node:url';
import CadastroService from './services/CadastroService.js';
import EstoqueService from './services/EstoqueService.js';
import OrdemServicoService from './services/OrdemServicoService.js';
import pecasIniciais from './dados/pecasIniciais.js';
import criarRotasCadastro from './routes/cadastro.js';
import criarRotasOrdens from './routes/ordens.js';

export function criarApp({
  cadastroService = new CadastroService(),
  estoqueService = new EstoqueService(pecasIniciais),
} = {}) {
  const ordemService = new OrdemServicoService(cadastroService, estoqueService);
  const app = express();
  app.use(express.json());
  app.use(express.static(fileURLToPath(new URL('../public', import.meta.url))));
  app.use('/api', criarRotasCadastro(cadastroService));
  app.use('/api', criarRotasOrdens(ordemService, estoqueService));
  return app;
}

export default criarApp;
