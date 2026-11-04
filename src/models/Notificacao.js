// Classe de projeto Notificacao — parte da OrdemDeServico (composição)
import ServicoMensagens from '../externo/ServicoMensagens.js';

export default class Notificacao {
  #mensagem;
  #dataEnvio = null;
  #enviada = false;

  constructor(mensagem) {
    this.#mensagem = mensagem;
  }

  // Caso de uso Notificar Cliente: entrega a mensagem ao Serviço de Mensagens externo
  enviar(telefone) {
    this.#enviada = ServicoMensagens.enviar(telefone, this.#mensagem);
    this.#dataEnvio = new Date();
    return this.#enviada;
  }

  foiEnviada() { return this.#enviada; }

  toJSON() {
    return {
      mensagem: this.#mensagem,
      dataEnvio: this.#dataEnvio ? this.#dataEnvio.toISOString() : null,
      enviada: this.#enviada,
    };
  }
}
