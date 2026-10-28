# MecaGest — Sistema de Gestão de Oficina Mecânica

## 1. Descrição do projeto

### 1.1 Contexto e problema

Uma oficina mecânica de pequeno porte, com um atendente, quatro mecânicos e um gerente (dono), controla hoje seus atendimentos em papel e em uma planilha. As ordens de serviço são preenchidas à mão, os orçamentos são passados ao cliente por telefone sem registro formal da aprovação, e o estoque de peças só é conferido quando alguma peça falta no meio de um serviço. Isso já causou:

- serviços executados sem a aprovação do cliente, gerando discussão na hora do pagamento;
- veículos parados por falta de peça que deveria estar em estoque;
- dificuldade do gerente em saber quanto a oficina faturou no mês e quais serviços são mais realizados;
- clientes ligando várias vezes para saber se o carro está pronto.

### 1.2 Objetivo do sistema

Informatizar o fluxo de atendimento da oficina, desde a entrada do veículo até o pagamento, registrando a ordem de serviço, o orçamento e sua aprovação, as peças e serviços utilizados, e mantendo o estoque de peças e o faturamento sob controle.

### 1.3 Escopo

**O sistema faz:**

- Cadastro de clientes e de seus veículos
- Abertura e acompanhamento de ordens de serviço (OS)
- Elaboração de orçamento e registro da aprovação ou recusa do cliente
- Registro dos serviços executados e das peças utilizadas em cada OS
- Controle de estoque de peças, com alerta de estoque mínimo
- Registro do pagamento da OS
- Notificação ao cliente quando o veículo estiver pronto, via serviço externo de mensagens
- Relatório mensal de faturamento para o gerente

**O sistema não faz:**

- Emissão de nota fiscal (continua sendo feita no sistema da contabilidade)
- Agendamento online feito pelo próprio cliente
- Processamento de pagamento com cartão (o sistema apenas registra a forma de pagamento usada)
- Compra automática de peças junto a fornecedores
- Controle de folha de pagamento ou comissão dos mecânicos

---

## 2. Requisitos

### 2.1 Requisitos Funcionais (RF)

**RF-01**
**Nome:** Autenticar usuário
**Descrição:** O sistema deve permitir que o funcionário acesse o sistema informando e-mail e senha cadastrados, liberando apenas as funcionalidades do seu perfil (Atendente, Mecânico ou Gerente).

**RF-02**
**Nome:** Cadastrar cliente
**Descrição:** O sistema deve permitir que o atendente cadastre um cliente informando nome, CPF, telefone e e-mail.

**RF-03**
**Nome:** Cadastrar veículo
**Descrição:** O sistema deve permitir que o atendente cadastre um veículo vinculado a um cliente, informando placa, marca, modelo, ano e quilometragem atual.

**RF-04**
**Nome:** Abrir ordem de serviço
**Descrição:** O sistema deve permitir que o atendente abra uma ordem de serviço para um veículo cadastrado, registrando a data de entrada, a quilometragem e a descrição do problema relatado pelo cliente. A OS deve ser criada com o status "Aberta".

**RF-05**
**Nome:** Elaborar orçamento
**Descrição:** O sistema deve permitir que o mecânico responsável pela OS registre o diagnóstico e monte o orçamento, adicionando serviços (descrição e valor da mão de obra) e peças do estoque (com quantidade). O sistema deve calcular automaticamente o valor total do orçamento. Ao confirmar o orçamento, a OS passa para o status "Aguardando aprovação".

**RF-06**
**Nome:** Registrar aprovação do orçamento
**Descrição:** O sistema deve permitir que o atendente registre se o cliente aprovou ou recusou o orçamento, guardando a data e a hora da decisão. Ao aprovar, a OS passa para o status "Em execução"; ao recusar, para "Cancelada".

**RF-07**
**Nome:** Registrar execução do serviço
**Descrição:** O sistema deve permitir que o mecânico marque cada serviço do orçamento como concluído e, quando todos estiverem concluídos, finalize a OS, que passa para o status "Pronta para retirada".

**RF-08**
**Nome:** Baixar peças do estoque
**Descrição:** O sistema deve subtrair automaticamente do estoque a quantidade de cada peça incluída na OS no momento em que o orçamento for aprovado.

**RF-09**
**Nome:** Gerenciar estoque de peças
**Descrição:** O sistema deve permitir que o gerente cadastre peças (código, descrição, preço de venda, quantidade em estoque e estoque mínimo) e registre entradas de novas unidades.

**RF-10**
**Nome:** Emitir alerta de estoque mínimo
**Descrição:** O sistema deve exibir um alerta ao gerente sempre que a quantidade de uma peça ficar igual ou abaixo do estoque mínimo cadastrado.

**RF-11**
**Nome:** Notificar cliente
**Descrição:** Quando uma OS mudar para o status "Pronta para retirada", o sistema deve enviar ao cliente, por meio do Serviço de Mensagens externo, uma mensagem informando que o veículo está pronto e o valor total a pagar.

**RF-12**
**Nome:** Registrar pagamento
**Descrição:** O sistema deve permitir que o atendente registre o pagamento de uma OS, informando a forma de pagamento (dinheiro, Pix, cartão de débito ou cartão de crédito) e o valor pago. Após o registro, a OS passa para o status "Finalizada".

**RF-13**
**Nome:** Consultar histórico do veículo
**Descrição:** O sistema deve permitir que o atendente e o mecânico consultem, pela placa, todas as ordens de serviço já realizadas em um veículo, com data, quilometragem e serviços executados.

**RF-14**
**Nome:** Gerar relatório de faturamento
**Descrição:** O sistema deve permitir que o gerente gere, para um mês informado, um relatório com a quantidade de OS finalizadas, o valor total faturado (separado em mão de obra e peças) e os cinco serviços mais realizados.

---

### 2.2 Requisitos Não Funcionais (RNF)

**RNF-01** *(de produto — desempenho)*
**Nome:** Tempo de resposta da busca
**Descrição:** A busca de cliente por CPF ou de veículo por placa deve retornar o resultado em até 2 segundos, com até 10.000 registros cadastrados.

**RNF-02** *(de produto — usabilidade)*
**Nome:** Agilidade na abertura de OS
**Descrição:** Um atendente, após 1 hora de treinamento, deve conseguir abrir uma ordem de serviço para um veículo já cadastrado em até 2 minutos.

**RNF-03** *(de produto — segurança)*
**Nome:** Armazenamento seguro de senhas
**Descrição:** As senhas dos funcionários devem ser armazenadas apenas na forma de hash (algoritmo bcrypt), nunca em texto puro.

**RNF-04** *(de produto — disponibilidade)*
**Nome:** Disponibilidade no horário de funcionamento
**Descrição:** O sistema deve permanecer disponível de segunda a sábado, das 7h30 às 18h00, com no máximo 15 minutos de indisponibilidade por mês nesse horário.

**RNF-05** *(organizacional — tecnologia)*
**Nome:** Plataforma de desenvolvimento
**Descrição:** O sistema deve ser desenvolvido em Node.js com o framework Express, e acessado pelo navegador (Google Chrome ou Microsoft Edge, versões dos últimos 2 anos), sem necessidade de instalação nos computadores da oficina.

**RNF-06** *(organizacional — processo)*
**Nome:** Versionamento do código
**Descrição:** Todo o código-fonte deve ser versionado com Git, com mensagens de commit no padrão Conventional Commits.

**RNF-07** *(externo — legal)*
**Nome:** Conformidade com a LGPD
**Descrição:** O sistema deve atender à Lei Geral de Proteção de Dados (Lei nº 13.709/2018): CPF e telefone do cliente só podem ser exibidos a usuários autenticados, e o cliente pode solicitar a exclusão de seus dados pessoais, que devem ser anonimizados em até 15 dias.

---

### 2.3 Regras de Negócio (RN)

**RN-01**
**Nome:** Cliente único por CPF
**Descrição:** O sistema não deve permitir o cadastro de dois clientes com o mesmo CPF.

**RN-02**
**Nome:** Veículo único por placa
**Descrição:** O sistema não deve permitir o cadastro de dois veículos com a mesma placa.

**RN-03**
**Nome:** Uma OS ativa por veículo
**Descrição:** Um veículo não pode ter mais de uma ordem de serviço com status diferente de "Finalizada" ou "Cancelada" ao mesmo tempo.

**RN-04**
**Nome:** Execução somente após aprovação
**Descrição:** Nenhum serviço pode ser marcado como concluído enquanto o orçamento da OS não tiver sido aprovado pelo cliente.

**RN-05**
**Nome:** Peça sem estoque
**Descrição:** Não é permitido aprovar um orçamento que contenha peça com quantidade solicitada maior que a quantidade disponível em estoque.

**RN-06**
**Nome:** Retirada somente após pagamento
**Descrição:** Uma OS só pode ser marcada como "Finalizada" (veículo liberado para o cliente) após o registro do pagamento do valor total.

**RN-07**
**Nome:** Garantia de serviço
**Descrição:** Todo serviço executado tem garantia de 90 dias. Se o mesmo serviço for realizado novamente no mesmo veículo dentro desse prazo, a mão de obra não deve ser cobrada.

**RN-08**
**Nome:** Permissões por perfil
**Descrição:** Apenas o Gerente pode cadastrar peças, alterar preços e gerar relatórios de faturamento. Apenas o Mecânico pode elaborar orçamentos e registrar a execução de serviços.
