// Ator externo «sistema» Serviço de Mensagens.
// Nesta versão inicial o envio é SIMULADO: a mensagem é exibida no terminal do servidor.
// Em produção, este módulo seria trocado pela integração com um provedor de SMS/WhatsApp.
const ServicoMensagens = {
  disponivel: true,

  enviar(telefone, texto) {
    if (!this.disponivel) return false;
    console.log(`[Serviço de Mensagens] Para ${telefone}: ${texto}`);
    return true;
  },
};

export default ServicoMensagens;
