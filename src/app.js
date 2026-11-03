import express from 'express';
import { fileURLToPath } from 'node:url';
import CadastroService from './services/CadastroService.js';
import criarRotasCadastro from './routes/cadastro.js';

export function criarApp(cadastroService = new CadastroService()) {
  const app = express();
  app.use(express.json());
  app.use(express.static(fileURLToPath(new URL('../public', import.meta.url))));
  app.use('/api', criarRotasCadastro(cadastroService));
  return app;
}

export default criarApp;
