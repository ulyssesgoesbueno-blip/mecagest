// Enumeração FormaPagamento (ver docs/03-diagrama-de-classes.md)
const FormaPagamento = Object.freeze({
  DINHEIRO: 'DINHEIRO',
  PIX: 'PIX',
  CARTAO_DEBITO: 'CARTAO_DEBITO',
  CARTAO_CREDITO: 'CARTAO_CREDITO',
});

export default FormaPagamento;
