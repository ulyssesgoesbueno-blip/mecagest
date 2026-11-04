// Enumeração StatusOS (ver docs/03-diagrama-de-classes.md)
const StatusOS = Object.freeze({
  ABERTA: 'ABERTA',
  AGUARDANDO_APROVACAO: 'AGUARDANDO_APROVACAO',
  EM_EXECUCAO: 'EM_EXECUCAO',
  PRONTA_PARA_RETIRADA: 'PRONTA_PARA_RETIRADA',
  FINALIZADA: 'FINALIZADA',
  CANCELADA: 'CANCELADA',
});

export default StatusOS;
