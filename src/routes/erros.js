import { RegraDeNegocioError, NaoEncontradoError } from '../services/CadastroService.js';

// Converte erros do domínio em respostas HTTP
export function responderErro(res, erro) {
  if (erro instanceof NaoEncontradoError) return res.status(404).json({ erro: erro.message });
  if (erro instanceof RegraDeNegocioError) return res.status(409).json({ erro: erro.message });
  return res.status(400).json({ erro: erro.message });
}
