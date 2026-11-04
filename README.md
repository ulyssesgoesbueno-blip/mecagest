# MecaGest — Sistema de Gestão de Oficina Mecânica

Projeto desenvolvido para a disciplina **Análise e Projeto de Sistemas**.

**Integrante:** Ulysses Bueno de Camargo Goes

## Descrição

O MecaGest informatiza o fluxo de atendimento de uma oficina mecânica de pequeno porte: cadastro de clientes e veículos, abertura de ordens de serviço, orçamento com registro da aprovação do cliente, controle de estoque de peças, registro de pagamento, notificação ao cliente quando o veículo está pronto e relatório mensal de faturamento.

## Documentação

- [Descrição do projeto e requisitos](docs/01-descricao-e-requisitos.md)
- [Casos de uso: diagrama e descrições textuais](docs/02-casos-de-uso.md)
- [Diagrama de classes de projeto](docs/03-diagrama-de-classes.md)

## Tecnologias

- Node.js
- Express

## Funcionalidades implementadas

- Cadastro de cliente com validação de CPF (RF-02, RN-01)
- Cadastro de veículo vinculado ao cliente (RF-03, RN-02)
- Consulta de veículo pela placa, com o proprietário (caso de uso Consultar Veículo)
- Abertura de ordem de serviço, permitindo só uma OS ativa por veículo (RF-04, RN-03)
- Elaboração de orçamento com serviços e peças do estoque, com cálculo automático do total (RF-05)
- Aprovação ou recusa do orçamento, com baixa automática no estoque e alerta de estoque mínimo (RF-06, RF-08, RF-10, RN-05)
- Registro da execução dos serviços e finalização da OS (RF-07, RN-04)
- Notificação ao cliente quando o veículo fica pronto (RF-11). Nesta versão, o Serviço de Mensagens é **simulado**: a mensagem aparece na tela e no terminal do servidor
- Registro do pagamento, que libera o veículo (RF-12, RN-06)
- Garantia de 90 dias: o mesmo serviço repetido nesse prazo não cobra mão de obra (RN-07)

## Ainda não implementado

- Autenticação de funcionários e permissões por perfil (RF-01, RN-08)
- Cadastro e entrada de peças pela tela do gerente (RF-09). Por enquanto, o estoque vem pré-cadastrado
- Consulta do histórico completo do veículo (RF-13) e relatório de faturamento (RF-14)
- Gravação em banco de dados: os dados ficam em memória e são apagados ao reiniciar o servidor

## Como executar

Pré-requisito: [Node.js](https://nodejs.org) versão 18 ou superior.

```bash
git clone https://github.com/ulyssesgoesbueno-blip/mecagest.git
cd mecagest
npm install
npm start
```

Depois, abra **http://localhost:3000** no navegador.

Para rodar os testes automatizados das regras de negócio:

```bash
npm test
```

## Estrutura do código

```
src/
  models/        Classes de domínio, conforme o diagrama de classes
  services/      Regras de negócio dos casos de uso
  dados/         Peças pré-cadastradas para demonstração
  externo/       Integração com sistemas externos (Serviço de Mensagens, simulado)
  routes/        Rotas da API REST (Express)
  app.js         Configuração do Express
  server.js      Inicialização do servidor
public/          Tela web (HTML)
test/            Testes automatizados (node:test)
```
