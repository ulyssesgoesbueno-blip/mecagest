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
  routes/        Rotas da API REST (Express)
  app.js         Configuração do Express
  server.js      Inicialização do servidor
public/          Tela web (HTML)
test/            Testes automatizados (node:test)
```
